import { Link } from "react-router-dom";
import type { Article, ArticleState } from "../../data/types";
import { BookmarkButton } from "../actions/BookmarkButton";
import { ButtonLink } from "../actions/Button";
import { Icon } from "../brand/Icon";
import { ContentCover } from "./ContentCover";
import { AuthorMetadata, ContentTypeBadge, DurationIndicator, ReadingStatus, durationLabel } from "./meta";
import "./content.css";

/** Penpot ArticleCard — Layout: Featured · Standard · Compact; Type and Status come from the data. */
export type ArticleCardLayout = "featured" | "standard" | "compact";

interface ArticleCardProps {
  article: Article;
  state: ArticleState;
  layout?: ArticleCardLayout;
  onBookmark: () => void;
  /** Compact cards on narrow screens fold the byline into the publication line (Penpot Mobile). */
  className?: string;
  headingLevel?: "h2" | "h3";
}

export function ArticleCard({ article, state, layout = "standard", onBookmark, className = "", headingLevel = "h3" }: ArticleCardProps) {
  const H = headingLevel;
  const href = `/read/${article.id}`;
  const status = state.status;
  const media = (
    <div className="article-card__media">
      <ContentCover tone={article.cover} />
      {(article.type === "Video" || article.type === "Audio") && (
        <span className="article-card__media-badge" aria-hidden="true">
          <Icon name={article.type === "Video" ? "play" : "audio"} />
        </span>
      )}
    </div>
  );

  if (layout === "featured") {
    return (
      <article className={`article-card article-card--featured ${className}`}>
        {media}
        <div className="article-card__body">
          <div className="article-card__meta-top">
            <span className="overline eyebrow">{article.publication}</span>
            <ContentTypeBadge type={article.type} />
          </div>
          <H className="type-heading-1 article-card__title">
            <Link to={href} className="article-card__link">
              {article.title}
            </Link>
          </H>
          <p className="type-body-lg article-card__excerpt">{article.excerpt}</p>
          <AuthorMetadata author={article.author} initials={article.authorInitials} publication={article.publication} />
          <div className="article-card__footer article-card__footer--featured">
            <div className="article-card__status-group">
              <DurationIndicator label={durationLabel(article.type, article.minutes)} />
              <ReadingStatus status={status} progress={state.progress} minutes={article.minutes} />
            </div>
            <div className="article-card__actions">
              <ButtonLink to={href} intent="primary" size="md" className="article-card__cta">
                {status === "In progress" ? "Continue reading" : status === "Completed" ? "Read again" : "Start reading"}
              </ButtonLink>
              <BookmarkButton saved={state.bookmarked} onToggle={onBookmark} title={article.title} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (layout === "compact") {
    return (
      <article className={`article-card article-card--compact ${className}`}>
        {media}
        <div className="article-card__body">
          <span className="overline article-card__pub">
            {article.publication}
            <span className="article-card__pub-time"> · {article.minutes} min</span>
          </span>
          <H className="article-card__title article-card__title--compact">
            <Link to={href} className="article-card__link">
              {article.title}
            </Link>
          </H>
          <div className="article-card__footer">
            <div className="article-card__status-group article-card__status-group--row">
              <span className="type-caption article-card__byline">
                {article.author} · {durationLabel(article.type, article.minutes)}
              </span>
              <ReadingStatus status={status} progress={state.progress} minutes={article.minutes} />
            </div>
            <BookmarkButton saved={state.bookmarked} onToggle={onBookmark} title={article.title} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`article-card article-card--standard ${className}`}>
      {media}
      <div className="article-card__body">
        <div className="article-card__meta-top">
          <span className="overline muted">{article.publication}</span>
          <ContentTypeBadge type={article.type} />
        </div>
        <H className="type-heading-3 article-card__title">
          <Link to={href} className="article-card__link">
            {article.title}
          </Link>
        </H>
        <p className="type-body-sm article-card__excerpt">{article.excerpt}</p>
        <div className="article-card__footer">
          <div className="article-card__status-group">
            <span className="type-caption article-card__byline">
              {article.author} · {durationLabel(article.type, article.minutes)}
            </span>
            <ReadingStatus status={status} progress={state.progress} minutes={article.minutes} />
          </div>
          <BookmarkButton saved={state.bookmarked} onToggle={onBookmark} title={article.title} />
        </div>
      </div>
    </article>
  );
}
