import { Link } from "react-router-dom";
import type { Collection } from "../../data/types";
import { Icon } from "../brand/Icon";
import { ContentCover } from "./ContentCover";
import "./content.css";

/** Penpot CollectionCard — stacked covers · meta · title · description · progress. Hover state via CSS. */
export function CollectionCard({ collection, progressLabel, headingLevel = "h3" }: { collection: Collection; progressLabel: string; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="collection-card">
      <div className="collection-card__stack" aria-hidden="true">
        {collection.covers.map((tone, i) => (
          <ContentCover key={i} tone={tone} className={`collection-card__cover collection-card__cover--${i + 1}`} />
        ))}
      </div>
      <div className="collection-card__body">
        <span className="overline muted">
          {collection.articleIds.length} pieces · {collection.updatedLabel}
        </span>
        <H className="type-heading-3">
          <Link to={`/collections/${collection.id}`} className="article-card__link">
            {collection.name}
          </Link>
        </H>
        <p className="type-body-sm collection-card__desc">{collection.description}</p>
        <div className="collection-card__footer">
          <span className="type-caption muted">{progressLabel}</span>
          <Icon name="arrow-right" />
        </div>
      </div>
    </article>
  );
}
