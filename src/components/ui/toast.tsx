"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

interface ToastOptions {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3000;
const EXIT_DURATION = 200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastOptions | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };
  }, []);

  const showToast = React.useCallback((options: ToastOptions) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (removeTimer.current) clearTimeout(removeTimer.current);

    setToast(options);
    // Let the element mount with its hidden state before transitioning in.
    requestAnimationFrame(() => setVisible(true));

    hideTimer.current = setTimeout(() => {
      setVisible(false);
      removeTimer.current = setTimeout(() => setToast(null), EXIT_DURATION);
    }, TOAST_DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="true"
            className="pointer-events-none fixed bottom-6 right-6 z-[110]"
          >
            {toast && (
              <div
                className={`keycap pointer-events-auto flex items-center gap-3 px-4 py-3 shadow-xl transition-all duration-200 ease-out ${
                  visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-keycap bg-accent-cyan/15 text-accent-cyan">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-ink">{toast.message}</span>
                {toast.actionHref && toast.actionLabel && (
                  <Link
                    href={toast.actionHref}
                    className="text-sm font-medium text-accent-violet transition-colors hover:text-accent-cyan"
                  >
                    {toast.actionLabel}
                  </Link>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
