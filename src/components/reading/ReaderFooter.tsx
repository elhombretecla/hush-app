import type { Article } from "../../data/types";
import { Button } from "../actions/Button";
import { Icon } from "../brand/Icon";
import { AuthorMetadata, TopicTag } from "../content/meta";
import "./reading.css";

/** Penpot ReaderFooter — source · topics · Mark as finished · Add to collection. */
export function ReaderFooter({ article, finished, onFinish, onCollect }: { article: Article; finished: boolean; onFinish: () => void; onCollect: () => void }) {
  return (
    <footer className="reader-footer">
      <div className="reader-footer__source">
        <AuthorMetadata author={article.author} initials={article.authorInitials} publication={article.publication} />
        <span className="type-caption reader-footer__url">
          <Icon name="link" size={18} />
          {article.url}
        </span>
      </div>
      <div className="reader-footer__topics">
        {article.topics.map((t) => (
          <TopicTag key={t} label={t} />
        ))}
      </div>
      <div className="reader-footer__actions">
        <Button intent="primary" size="lg" onClick={onFinish} icon={finished ? "check" : undefined}>
          {finished ? "Finished" : "Mark as finished"}
        </Button>
        <Button intent="secondary" size="lg" onClick={onCollect}>
          Add to collection
        </Button>
      </div>
    </footer>
  );
}
