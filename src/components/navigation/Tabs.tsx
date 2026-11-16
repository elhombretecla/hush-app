import "./navigation.css";

/** Penpot Tabs — Tab (State: Active · Inactive), underline style. */
export function Tabs<T extends string>({ label, tabs, value, onChange }: { label: string; tabs: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={t.value === value} className={`tab ${t.value === value ? "is-active" : ""}`} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
