import { Link } from "react-router-dom";
import type { Article } from "../../data/types";
import { IconButton } from "../actions/IconButton";
import { Checkbox } from "../forms/Checkbox";
import { ContentCover } from "./ContentCover";
import { DurationIndicator, TopicTag } from "./meta";
import "./content.css";

/** Penpot ContentListItem — State: Default · Hover (reveals organize actions) · Selected. */
interface ContentListItemProps {
  article: Article;
  meta: string;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onAddToCollection: () => void;
  onArchive: () => void;
}

export function ContentListItem({ article, meta, selected, onSelect, onAddToCollection, onArchive }: ContentListItemProps) {
  return (
    <div className={`list-item ${selected ? "is-selected" : ""}`}>
      <Checkbox checked={selected} onChange={onSelect} label={`Select “${article.title}”`} hideLabel />
      <div className="list-item__thumb" aria-hidden="true">
        <ContentCover tone={article.cover} />
      </div>
      <div className="list-item__text">
        <Link to={`/read/${article.id}`} className="list-item__title article-card__link">
          {article.title}
        </Link>
        <span className="type-caption muted">{meta}</span>
      </div>
      <span className="list-item__topic">
        <TopicTag label={article.topics[0]} />
      </span>
      <span className="list-item__duration">
        <DurationIndicator label={`${article.minutes} min`} />
      </span>
      <div className="list-item__actions">
        <IconButton icon="collection" label={`Add “${article.title}” to a collection`} onClick={onAddToCollection} />
        <IconButton icon="archive" label={`Archive “${article.title}”`} onClick={onArchive} />
      </div>
    </div>
  );
}
