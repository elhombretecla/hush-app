import { useEffect, useState } from "react";
import type { Article } from "../../data/types";
import { ContentCover } from "./ContentCover";
import "./content.css";

/** Remote images go through the local /api/image cache so covers survive hotlink protection. */
export const imageSrc = (src: string) => (src.startsWith("/api/") || src.startsWith("data:") ? src : `/api/image?src=${encodeURIComponent(src)}`);

/** Captured thumbnail when there is one; otherwise (or if it fails to load) the Penpot ContentCover. */
export function ArticleMedia({ article, className = "" }: { article: Pick<Article, "image" | "cover" | "imageFrom">; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [article.image]);
  if (!article.image || failed) return <ContentCover tone={article.cover} className={className} />;
  return (
    <img
      className={`article-media ${article.imageFrom === "screenshot" ? "article-media--shot" : ""} ${className}`}
      src={imageSrc(article.image)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
