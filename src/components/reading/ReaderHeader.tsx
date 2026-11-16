import { useNavigate } from "react-router-dom";
import { BookmarkButton } from "../actions/BookmarkButton";
import { IconButton } from "../actions/IconButton";
import { Icon } from "../brand/Icon";
import { ReadingProgress } from "./ReadingProgress";
import "./reading.css";

/** Penpot ReaderHeader — BackButton · publication + title · time left · actions · ReadingProgress. */
interface ReaderHeaderProps {
  publication: string;
  title: string;
  progress: number;
  timeLeft: string;
  bookmarked: boolean;
  prefsOpen: boolean;
  onBookmark: () => void;
  onPreferences: () => void;
  onHighlights: () => void;
  onCollect: () => void;
  backTo: string;
  backLabel: string;
}

export function ReaderHeader({ publication, title, progress, timeLeft, bookmarked, prefsOpen, onBookmark, onPreferences, onHighlights, onCollect, backTo, backLabel }: ReaderHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="reader-header">
      <div className="reader-header__bar">
        <button type="button" className="back-button" onClick={() => navigate(backTo)}>
          <Icon name="chevron-left" />
          <span>{backLabel}</span>
        </button>
        <div className="reader-header__context" aria-hidden="true">
          <span className="overline">{publication}</span>
          <span className="type-label-sm reader-header__title">{title}</span>
        </div>
        <div className="reader-header__actions">
          <span className="type-caption reader-header__time">{timeLeft}</span>
          <IconButton icon="type" label="Reading preferences" pressed={prefsOpen} onClick={onPreferences} aria-expanded={prefsOpen} />
          <IconButton icon="highlight" label="Highlights in this piece" onClick={onHighlights} />
          <BookmarkButton saved={bookmarked} onToggle={onBookmark} title={title} />
          <IconButton icon="collection" label="Add to collection" onClick={onCollect} />
        </div>
      </div>
      <ReadingProgress value={progress} />
    </header>
  );
}
