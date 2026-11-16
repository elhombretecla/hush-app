import type { ReactNode } from "react";
import type { HighlightColor } from "../../data/types";
import "./reading.css";

/** Penpot TextHighlight — State: Default · Hover (CSS) · With note. Colour from the HighlightActionBar swatches. */
interface TextHighlightProps {
  children: ReactNode;
  color?: HighlightColor;
  withNote?: boolean;
  active?: boolean;
  label: string;
  highlightId?: string;
  onActivate?: (el: HTMLElement) => void;
}

export function TextHighlight({ children, color = "honey", withNote, active, label, highlightId, onActivate }: TextHighlightProps) {
  return (
    <mark
      className={`text-highlight text-highlight--${color} ${active ? "is-active" : ""} ${withNote ? "has-note" : ""}`}
      data-highlight-id={highlightId}
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={(e) => onActivate?.(e.currentTarget)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onActivate?.(e.currentTarget))}
    >
      {children}
    </mark>
  );
}
