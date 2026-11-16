import "./brand.css";

/** Penpot: Brand / Wordmark / Primary · Reversed · Compact (HUSH / Design Foundations). */
interface WordmarkProps {
  variant?: "primary" | "reversed" | "compact";
  size?: number;
  className?: string;
}

export function Wordmark({ variant = "primary", size = 40, className = "" }: WordmarkProps) {
  return (
    <span className={`wordmark wordmark--${variant} ${className}`} style={{ fontSize: size }} aria-label="hush.">
      <span aria-hidden="true">{variant === "compact" ? "h" : "hush"}</span>
      <span className="wordmark__period" aria-hidden="true" />
    </span>
  );
}

/** Penpot: Brand / App Icon — an arch that makes room, with the warm period inside. */
export function AppIcon({ size = 72 }: { size?: number }) {
  return (
    <svg className="app-icon" width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <rect width="96" height="96" rx="22" style={{ fill: "var(--palette-moss-800)" }} />
      <path d="M25 74V47a23 23 0 0 1 46 0v27" fill="none" strokeWidth="5" strokeLinecap="round" style={{ stroke: "var(--palette-paper-50)" }} />
      <circle cx="48" cy="70" r="6.5" style={{ fill: "var(--palette-clay-300)" }} />
    </svg>
  );
}
