import { useStore } from "../../app/store";
import type { Theme } from "../../data/types";
import "./navigation.css";

/** Penpot ThemeSwitcher — three ThemeOption instances (Theme × Selected). Swatches use the primitive palette of each theme. */
const OPTIONS: { value: Theme; label: string }[] = [
  { value: "paper", label: "Paper" },
  { value: "night", label: "Night" },
  { value: "sepia", label: "Sepia" },
];

export function ThemeSwitcher({ fullWidth }: { fullWidth?: boolean }) {
  const { state, setPrefs } = useStore();
  return (
    <div className={`theme-switcher ${fullWidth ? "theme-switcher--full" : ""}`} role="radiogroup" aria-label="Appearance">
      {OPTIONS.map((o) => {
        const selected = state.prefs.theme === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={selected} className={`theme-option ${selected ? "is-selected" : ""}`} onClick={() => setPrefs({ theme: o.value })}>
            <span className={`theme-option__swatch theme-option__swatch--${o.value}`} aria-hidden="true">
              Aa
            </span>
            <span className="theme-option__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
