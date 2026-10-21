"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

/**
 * Custom listbox standing in for a native <select>. Gives us the dark keycap
 * surface and violet accents the native control can't be styled into, while
 * keeping full keyboard support (arrows, Home/End, Enter/Space, Esc).
 */
export function SortSelect({ value, onChange, options, className }: SortSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selected = options[selectedIndex];

  const openList = React.useCallback(() => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const commit = React.useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      setOpen(false);
    },
    [onChange, options]
  );

  // Close on any pointer press outside the control.
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted option in view without scrolling the page.
  React.useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (!list || !active) return;
    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [open, activeIndex]);

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (!open) break;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        if (!open) break;
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else openList();
        break;
      case "Escape":
        if (!open) break;
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-activedescendant={open ? `sort-option-${activeIndex}` : undefined}
        className="flex h-11 items-center gap-2 rounded-keycap border border-base-border bg-base-panel pl-3.5 pr-3 text-sm transition-colors hover:border-accent-violet/40 focus-visible:border-accent-violet/60 focus-visible:outline-none"
      >
        <span className="whitespace-nowrap text-ink-muted">Sort by:</span>
        <span className="flex items-center gap-1.5 text-ink">
          <span className="whitespace-nowrap">{selected?.label}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 text-ink-muted transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Sort by"
          tabIndex={-1}
          className="animate-sort-popover thin-scrollbar absolute right-0 top-full z-30 mt-2 max-h-64 min-w-full overflow-y-auto rounded-keycap border border-base-border bg-base-raised p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)] outline-none"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`sort-option-${index}`}
                role="option"
                aria-selected={isSelected}
                data-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive && "bg-accent-violet/10",
                  isSelected ? "text-accent-violet" : "text-ink"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
