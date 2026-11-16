import type { ReactNode } from "react";

/** Penpot Popover — a small non-modal panel anchored to the control that opened it. Position comes from className. */
export function Popover({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`popover ${className}`} role="dialog" aria-label={label}>
      {children}
    </div>
  );
}
