"use client";

import * as React from "react";
import { SALE_ENDS_AT } from "@/lib/home-content";

const TARGET = new Date(SALE_ENDS_AT).getTime();
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(now: number): Remaining | null {
  const diff = TARGET - now;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor(diff / HOUR) % 24,
    minutes: Math.floor(diff / MINUTE) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

/**
 * Demo sale countdown. Renders nothing on the server / before mount so the
 * first client paint can't mismatch, and nothing once the deadline passes.
 */
export function SaleCountdown() {
  const [remaining, setRemaining] = React.useState<Remaining | null>(null);

  React.useEffect(() => {
    function tick() {
      setRemaining(getRemaining(Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!remaining) return null;

  const units: { label: string; value: number }[] = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div className="flex items-start gap-5">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col">
          <span className="font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
