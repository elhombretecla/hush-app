import { useStore } from "../../app/store";
import type { Theme } from "../../data/types";
import "./navigation.css";

/** Penpot ThemeSwitcher — three ThemeOption instances (Theme × Selected). Swatches use the primitive palette of each theme. */
const OPTIONS: { value: Theme; label: string }[] = [
  { value: "paper", label: "Paper" },
  { value: "night", label: "Night" },
  { value: "sepia", label: "Sepia" },
];

/** Penpot ThemeOption — Theme × Selected. Swatch colours use each theme's primitive palette. */
export function ThemeOption({ theme, label, selected, onSelect }: { theme: Theme; label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={`theme-option ${selected ? "is-selected" : ""}`} onClick={onSelect}>
      <span className={`theme-option__swatch theme-option__swatch--${theme}`} aria-hidden="true">
        Aa
      </span>
      <span className="theme-option__label">{label}</span>
    </button>
  );
}

export function ThemeSwitcher({ fullWidth }: { fullWidth?: boolean }) {
  const { state, setPrefs } = useStore();
  return (
    <div className={`theme-switcher ${fullWidth ? "theme-switcher--full" : ""}`} role="radiogroup" aria-label="Appearance">
      {OPTIONS.map((o) => (
        <ThemeOption key={o.value} theme={o.value} label={o.label} selected={state.prefs.theme === o.value} onSelect={() => setPrefs({ theme: o.value })} />
      ))}
    </div>
  );
}
