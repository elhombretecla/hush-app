import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon } from "../brand/Icon";
import "./forms.css";

/** Penpot SearchInput — State: Default (shortcut hint) · Focus · Filled (clear). */
interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (v: string) => void;
  label: string;
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ value, onChange, label, shortcut, className = "", ...rest }, ref) {
  return (
    <div className={`field search-input ${className}`}>
      <Icon name="search" />
      <input ref={ref} type="search" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {value ? (
        <button type="button" className="field__clear" aria-label="Clear search" onClick={() => onChange("")}>
          <Icon name="close" />
        </button>
      ) : (
        shortcut && (
          <kbd className="field__kbd" aria-hidden="true">
            {shortcut}
          </kbd>
        )
      )}
    </div>
  );
});
