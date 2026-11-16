import { useStore } from "../../app/store";
import type { LineSpacing, ReadingFont, ReadingWidth } from "../../data/types";
import { IconButton } from "../actions/IconButton";
import { SegmentedControl } from "../actions/SegmentedControl";
import { ThemeSwitcher } from "../navigation/ThemeSwitcher";
import "./reading.css";

/** Penpot ReadingPreferences — Appearance · Typeface · Text size · Line spacing · Width. Changes apply live. */
export function ReadingPreferencesPanel({ onClose, showWidth = true, embedded = false }: { onClose?: () => void; showWidth?: boolean; embedded?: boolean }) {
  const { state, setReading } = useStore();
  const r = state.prefs.reading;
  return (
    <div className={`reading-prefs ${embedded ? "reading-prefs--embedded" : ""}`}>
      {!embedded && (
        <div className="reading-prefs__header">
          <h2 className="type-heading-4">Reading preferences</h2>
          {onClose && <IconButton icon="close" label="Close reading preferences" onClick={onClose} />}
        </div>
      )}
      <div className="reading-prefs__group">
        <span className="overline muted">Appearance</span>
        <ThemeSwitcher fullWidth />
      </div>
      <div className="reading-prefs__group">
        <span className="overline muted">Typeface</span>
        <SegmentedControl<ReadingFont> label="Typeface" options={["Literata", "Inter", "Fraunces"]} value={r.font} onChange={(font) => setReading({ font })} fullWidth />
      </div>
      <div className="reading-prefs__group">
        <label className="overline muted" htmlFor="text-size">
          Text size · {r.fontSize}px
        </label>
        <div className="size-slider">
          <span className="size-slider__a size-slider__a--sm" aria-hidden="true">
            A
          </span>
          <input id="text-size" type="range" min={16} max={26} step={1} value={r.fontSize} onChange={(e) => setReading({ fontSize: Number(e.target.value) })} style={{ ["--fill" as string]: `${((r.fontSize - 16) / 10) * 100}%` }} />
          <span className="size-slider__a size-slider__a--lg" aria-hidden="true">
            A
          </span>
        </div>
      </div>
      <div className="reading-prefs__group">
        <span className="overline muted">Line spacing</span>
        <SegmentedControl<LineSpacing> label="Line spacing" options={["Tight", "Comfortable", "Airy"]} value={r.lineSpacing} onChange={(lineSpacing) => setReading({ lineSpacing })} fullWidth />
      </div>
      {showWidth && (
        <div className="reading-prefs__group">
          <span className="overline muted">Width</span>
          <SegmentedControl<ReadingWidth> label="Reading width" options={["Narrow", "Medium", "Wide"]} value={r.width} onChange={(width) => setReading({ width })} fullWidth />
        </div>
      )}
    </div>
  );
}
