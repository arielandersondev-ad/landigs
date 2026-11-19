"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  direction: "down" | "up";
  className?: string;
  children: (close: () => void) => ReactNode;
};

export function FloatingMenu({ label, hint, direction, className = "", children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`fmenu fmenu--${direction} ${className}`} data-open={open}>
      <button
        type="button"
        className="fmenu__trigger glass"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fmenu__label">{label}</span>
        {hint && <span className="fmenu__hint">{hint}</span>}
        <svg className="fmenu__chev" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div id={id} className="fmenu__panel glass" inert={!open}>
        {children(() => setOpen(false))}
      </div>
    </div>
  );
}
