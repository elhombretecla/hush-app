import { Icon } from "../brand/Icon";
import "./forms.css";

/** Penpot Checkbox — Checked × State. */
export function Checkbox({ checked, onChange, label, hideLabel, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hideLabel?: boolean; disabled?: boolean }) {
  return (
    <label className={`checkbox ${disabled ? "is-disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="checkbox__box" aria-hidden="true">
        {checked && <Icon name="check" size={18} />}
      </span>
      <span className={hideLabel ? "visually-hidden" : "checkbox__label"}>{label}</span>
    </label>
  );
}
