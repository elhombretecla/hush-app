import type { ReactNode } from "react";
import "./feedback.css";

/** Penpot EmptyState — Kind: Inbox zero · No results · Empty collection. The arch motif, never stock art. */
export function EmptyState({ kind, title, description, action }: { kind: "inbox-zero" | "no-results" | "empty-collection"; title: string; description: string; action?: ReactNode }) {
  return (
    <div className={`empty-state empty-state--${kind}`}>
      <svg className="empty-state__art" viewBox="0 0 120 96" aria-hidden="true">
        <path className="empty-state__arch" d="M28 96V48a32 32 0 0 1 64 0v48z" />
        <circle className="empty-state__dot" cx="60" cy="84" r="6" />
        <rect className="empty-state__floor" x="0" y="95" width="120" height="1" />
      </svg>
      <h2 className="type-heading-3">{title}</h2>
      <p className="type-body-md empty-state__desc">{description}</p>
      {action}
    </div>
  );
}
