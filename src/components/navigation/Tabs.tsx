import "./navigation.css";

/** Penpot Tab — State: Active · Inactive. */
export function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" role="tab" aria-selected={active} className={`tab ${active ? "is-active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

/** Penpot Tabs — a row of Tab instances, underline style. */
export function Tabs<T extends string>({ label, tabs, value, onChange }: { label: string; tabs: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <Tab key={t.value} active={t.value === value} label={t.label} onClick={() => onChange(t.value)} />
      ))}
    </div>
  );
}
