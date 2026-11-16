import type { ReactNode } from "react";
import "./content.css";

/** Penpot FilterBar — ContentFilter instances on the left, sort and view on the right. */
export function FilterBar({ filters, view, label = "Filters" }: { filters: ReactNode; view?: ReactNode; label?: string }) {
  return (
    <div className="filter-bar" role="group" aria-label={label}>
      <div className="filter-bar__filters">{filters}</div>
      {view && <div className="filter-bar__view">{view}</div>}
    </div>
  );
}
