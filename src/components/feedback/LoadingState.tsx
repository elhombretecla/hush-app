import "./feedback.css";

/** Penpot LoadingState — spinner · what is happening · detail. */
export function LoadingState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span className="loading-state__text">
        <span className="type-label-sm">{title}</span>
        {detail && <span className="type-caption muted">{detail}</span>}
      </span>
    </div>
  );
}
