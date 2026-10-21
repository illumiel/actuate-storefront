"use client";

import * as React from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_KEY = "actuate_newsletter";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [subscribed, setSubscribed] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please tick the box to receive the newsletter.");
      return;
    }

    setError(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } catch {
      // Storage may be unavailable (private mode); the sign-up still "works".
    }
    setSubscribed(true);
  }

  if (subscribed) {
    return (
      <p className="text-sm text-accent-cyan" role="status">
        Thanks, you&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="relative">
        <input
          type="email"
          name="newsletter-email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-11 w-full rounded-full border border-base-border bg-base pl-4 pr-28 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-none focus-visible:border-accent-violet/60"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 h-9 rounded-full border border-base-border bg-base-raised px-4 text-xs font-medium text-ink transition-colors hover:border-accent-violet/50 hover:text-accent-violet"
        >
          Subscribe
        </button>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (error) setError(null);
          }}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent-violet"
        />
        <span>I want to receive the newsletter.</span>
      </label>

      {error && (
        <p id="newsletter-error" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
