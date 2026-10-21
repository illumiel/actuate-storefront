"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ParallaxHero, type ParallaxLayer } from "@/components/parallax-hero";
import { heroSlides, type HeroSlide } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;

/** Dark violet-to-cyan fallback so a missing campaign image never looks broken. */
const FALLBACK_GRADIENT =
  "bg-[linear-gradient(135deg,#2A1F52_0%,#171C24_55%,#10302B_100%)]";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface HeroCarouselProps {
  layers: ParallaxLayer[];
  parallaxContent: React.ReactNode;
  className?: string;
}

export function HeroCarousel({ layers, parallaxContent, className }: HeroCarouselProps) {
  const slideCount = heroSlides.length;
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const touchStartX = React.useRef<number | null>(null);

  const goTo = React.useCallback(
    (next: number) => setIndex(((next % slideCount) + slideCount) % slideCount),
    [slideCount]
  );
  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  // Pause autoplay while the tab is in the background.
  React.useEffect(() => {
    function onVisibilityChange() {
      setTabHidden(document.hidden);
    }
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  React.useEffect(() => {
    if (reducedMotion || paused || tabHidden) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slideCount), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, tabHidden, reducedMotion, slideCount]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next();
    else prev();
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden outline-none",
        className
      )}
    >
      <div
        className="flex min-h-[440px] transition-transform duration-500 ease-out motion-reduce:transition-none sm:min-h-[520px]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {heroSlides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slideCount}`}
              aria-hidden={!active}
              className="relative w-full shrink-0"
            >
              {slide.kind === "parallax" ? (
                <ParallaxHero
                  layers={layers}
                  className="h-full min-h-[440px] sm:min-h-[520px]"
                >
                  <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
                    {parallaxContent}
                  </div>
                </ParallaxHero>
              ) : (
                <ImageSlide slide={slide} active={active} priority={i === 1} />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-ink" : "w-2.5 bg-ink/40 hover:bg-ink/70"
            )}
          />
        ))}
      </div>

      <span aria-live="polite" className="sr-only">
        {`Slide ${index + 1} of ${slideCount}`}
      </span>
    </div>
  );
}

function ImageSlide({
  slide,
  active,
  priority,
}: {
  slide: HeroSlide;
  active: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => setFailed(false), [slide.imageSrc]);

  const hasImage = Boolean(slide.imageSrc) && !failed;

  return (
    <div className="relative flex h-full min-h-[440px] w-full items-center overflow-hidden sm:min-h-[520px]">
      {hasImage ? (
        <Image
          src={slide.imageSrc!}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div aria-hidden="true" className={cn("absolute inset-0", FALLBACK_GRADIENT)} />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-base via-base/60 to-base/10"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-xl">
          {slide.eyebrow && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
              {slide.eyebrow}
            </p>
          )}
          <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            {slide.headline}
          </h2>
          {slide.linkLabel && slide.linkHref && (
            <Link
              href={slide.linkHref}
              tabIndex={active ? undefined : -1}
              className="mt-6 inline-block text-sm font-medium text-ink underline decoration-accent-violet underline-offset-4 transition-colors hover:text-accent-cyan hover:decoration-accent-cyan"
            >
              {slide.linkLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
