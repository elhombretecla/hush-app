import type { ContentType, ReadingStatus as Status } from "../../data/types";
import { Icon, type IconName } from "../brand/Icon";
import "./content.css";

const TYPE_ICON: Record<ContentType, IconName> = { Article: "article", Newsletter: "newsletter", Video: "video", Audio: "audio", Post: "quote" };

/** Penpot ContentTypeBadge — Type: Article · Newsletter · Video · Audio. */
export function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span className="type-badge">
      <Icon name={TYPE_ICON[type]} size={18} />
      {type}
    </span>
  );
}

/** Penpot TopicTag — State: Default · Selected. Rendered as a toggle button when interactive. */
export function TopicTag({ label, selected = false, onClick }: { label: string; selected?: boolean; onClick?: () => void }) {
  if (!onClick) return <span className={`topic-tag ${selected ? "is-selected" : ""}`}>{label}</span>;
  return (
    <button type="button" className={`topic-tag ${selected ? "is-selected" : ""}`} aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

/** Penpot ReadingStatus — Status: Unread · In progress · Completed. */
export function ReadingStatus({ status, progress = 0, minutes }: { status: Status; progress?: number; minutes: number }) {
  if (status === "Completed")
    return (
      <span className="reading-status reading-status--done">
        <Icon name="check" size={20} />
        Finished
      </span>
    );
  if (status === "In progress") {
    const pct = Math.round(progress * 100);
    const left = Math.max(1, Math.round(minutes * (1 - progress)));
    return (
      <span className="reading-status">
        <span className="reading-status__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
          <span style={{ width: `${pct}%` }} />
        </span>
        {pct}% · {left} min left
      </span>
    );
  }
  return (
    <span className="reading-status reading-status--unread">
      <span className="reading-status__dot" aria-hidden="true" />
      Unread
    </span>
  );
}

/** Penpot DurationIndicator. */
export function DurationIndicator({ label }: { label: string }) {
  return (
    <span className="duration">
      <Icon name="clock" size={18} />
      {label}
    </span>
  );
}

/** Penpot AuthorMetadata. */
export function AuthorMetadata({ author, initials, publication }: { author: string; initials: string; publication: string }) {
  return (
    <span className="author-meta">
      <span className="author-meta__avatar" aria-hidden="true">
        {initials}
      </span>
      <span className="author-meta__text">
        <span className="author-meta__name">{author}</span>
        <span className="author-meta__pub">{publication}</span>
      </span>
    </span>
  );
}

export const durationLabel = (type: ContentType, minutes: number) =>
  `${minutes} min ${type === "Video" ? "watch" : type === "Audio" ? "listen" : "read"}`;
