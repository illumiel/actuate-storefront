"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER = 400;

export function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-[80] flex h-10 w-10 items-center justify-center rounded-full border border-base-border bg-base-raised text-ink shadow-keycap transition-colors hover:border-accent-violet/50 hover:text-accent-violet"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
