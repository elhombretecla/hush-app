import "./forms.css";

/** Penpot Toggle — On × State. */
export function Toggle({ on, onChange, label, description }: { on: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="toggle-row">
      <span className="toggle-row__text">
        <span className="type-label-md">{label}</span>
        {description && <span className="type-caption muted">{description}</span>}
      </span>
      <input type="checkbox" role="switch" className="toggle__input" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle" aria-hidden="true">
        <span className="toggle__knob" />
      </span>
    </label>
  );
}
