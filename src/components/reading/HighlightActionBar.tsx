import type { HighlightColor } from "../../data/types";
import { Icon } from "../brand/Icon";
import "./reading.css";

/** Penpot HighlightActionBar — colour swatches · Note · Copy · Share. Appears above a text selection. */
interface Props {
  top: number;
  left: number;
  onHighlight: (color: HighlightColor) => void;
  onNote: () => void;
  onCopy: () => void;
}

export function HighlightActionBar({ top, left, onHighlight, onNote, onCopy }: Props) {
  return (
    <div className="highlight-bar" role="toolbar" aria-label="Selection" style={{ top, left }} onMouseDown={(e) => e.preventDefault()}>
      <div className="highlight-bar__swatches">
        {(["honey", "moss", "clay"] as const).map((c) => (
          <button key={c} type="button" className={`highlight-bar__swatch highlight-bar__swatch--${c}`} aria-label={`Highlight in ${c}`} onClick={() => onHighlight(c)} />
        ))}
      </div>
      <span className="highlight-bar__divider" aria-hidden="true" />
      <button type="button" className="highlight-bar__action" onClick={onNote}>
        <Icon name="note" />
        Note
      </button>
      <button type="button" className="highlight-bar__action" onClick={onCopy}>
        <Icon name="link" />
        Copy
      </button>
    </div>
  );
}
