import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../brand/Icon";
import "./content.css";

/** Penpot ContentFilter — Key · value · dropdown. State: Default · Active (value ≠ first option) · Open. */
interface ContentFilterProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

export function ContentFilter<T extends string>({ label, options, value, onChange }: ContentFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const active = value !== options[0];
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="content-filter" ref={ref}>
      <button
        type="button"
        className={`content-filter__trigger ${active ? "is-active" : ""} ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="content-filter__key">{label}</span>
        <span className="content-filter__value">{value}</span>
        <Icon name="chevron-down" size={20} />
      </button>
      {open && (
        <ul className="content-filter__menu" role="listbox" id={listId} aria-label={label}>
          {options.map((o) => (
            <li key={o} role="option" aria-selected={o === value}>
              <button
                type="button"
                className={o === value ? "is-selected" : ""}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
                {o === value && <Icon name="check" size={20} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
