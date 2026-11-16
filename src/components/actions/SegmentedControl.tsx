import { forwardRef, useRef, type ButtonHTMLAttributes, type KeyboardEvent } from "react";
import "./actions.css";

/** Penpot Segment — Selected: True · False. One option of a SegmentedControl. */
export const Segment = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }>(function Segment({ selected, className = "", children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1} className={`segment ${selected ? "is-selected" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
});

/** Penpot SegmentedControl (Options: 2 · 3) built from Segment (Selected: True · False). A single-choice radio group. */
interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  renderLabel?: (option: T) => string;
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({ label, options, value, onChange, renderLabel, fullWidth }: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + options.length) % options.length;
    onChange(options[next]);
    refs.current[next]?.focus();
  };
  return (
    <div className={`segmented ${fullWidth ? "segmented--full" : ""}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const selected = o === value;
        return (
          <Segment key={o} ref={(el) => (refs.current[i] = el)} selected={selected} onClick={() => onChange(o)} onKeyDown={(e) => onKey(e, i)}>
            {renderLabel ? renderLabel(o) : o}
          </Segment>
        );
      })}
    </div>
  );
}
