import { BookmarkButton } from "../actions/BookmarkButton";
import { IconButton } from "../actions/IconButton";
import "./reading.css";

/** Penpot ReadingToolbar — floating rail (desktop) / bottom pill (mobile). */
interface ReadingToolbarProps {
  orientation: "rail" | "pill";
  bookmarked: boolean;
  prefsOpen: boolean;
  onPreferences: () => void;
  onHighlights: () => void;
  onBookmark: () => void;
  onShare: () => void;
  title: string;
}

export function ReadingToolbar({ orientation, bookmarked, prefsOpen, onPreferences, onHighlights, onBookmark, onShare, title }: ReadingToolbarProps) {
  return (
    <div className={`reading-toolbar reading-toolbar--${orientation}`} role="toolbar" aria-label="Reading tools" aria-orientation={orientation === "rail" ? "vertical" : "horizontal"}>
      <IconButton icon="type" label="Reading preferences" pressed={prefsOpen} onClick={onPreferences} />
      <IconButton icon="highlight" label="Highlights and notes" onClick={onHighlights} />
      <BookmarkButton saved={bookmarked} onToggle={onBookmark} title={title} />
      <IconButton icon="share" label="Copy link" onClick={onShare} />
    </div>
  );
}
