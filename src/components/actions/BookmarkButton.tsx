import { Icon } from "../brand/Icon";
import "./actions.css";

/** Penpot BookmarkButton — State: Unsaved · Saved · Hover (CSS) · Disabled. */
interface BookmarkButtonProps {
  saved: boolean;
  onToggle: () => void;
  disabled?: boolean;
  title?: string;
}

export function BookmarkButton({ saved, onToggle, disabled, title }: BookmarkButtonProps) {
  const label = saved ? `Remove ${title ? `“${title}” ` : ""}from read later` : `Save ${title ? `“${title}” ` : ""}to read later`;
  return (
    <button
      type="button"
      className={`bookmark-button ${saved ? "is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved" : "Read later"}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <Icon name={saved ? "bookmark-filled" : "bookmark"} />
    </button>
  );
}
