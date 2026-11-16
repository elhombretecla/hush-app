import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../brand/Icon";
import "./forms.css";

/** Penpot Select (collection picker) — State: Default · Open. */
export interface SelectOption {
  value: string;
  label: string;
  dot?: "moss" | "clay" | "honey";
}

export function Select({ value, options, onChange, label, placeholder = "Choose…" }: { value: string; options: SelectOption[]; onChange: (v: string) => void; label: string; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value);
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
    <div className="select" ref={ref}>
      <button type="button" className={`field select__trigger ${open ? "is-open" : ""}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} aria-label={`${label}: ${current?.label ?? placeholder}`} onClick={() => setOpen((o) => !o)}>
        {current?.dot && <span className={`select__dot select__dot--${current.dot}`} aria-hidden="true" />}
        <span className={current ? "select__value" : "select__value muted"}>{current?.label ?? placeholder}</span>
        <Icon name="chevron-down" />
      </button>
      {open && (
        <ul className="select__menu" role="listbox" id={id} aria-label={label}>
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={o.value === value ? "is-selected" : ""}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.dot ? <span className={`select__dot select__dot--${o.dot}`} aria-hidden="true" /> : <span className="select__dot" aria-hidden="true" />}
                <span>{o.label}</span>
                {o.value === value && <Icon name="check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
