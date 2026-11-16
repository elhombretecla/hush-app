import type { ContentBlock, Highlight } from "../../data/types";
import "./reading.css";

/**
 * Penpot ReadingContentBlock — Type: Lead · Paragraph · Subheading · Section break, plus PullQuote.
 * Text is split into segments so saved highlights render as <mark> without touching the source text.
 */
interface Props {
  block: ContentBlock;
  highlights: Highlight[];
  author: string;
  activeHighlight?: string | null;
  onHighlightClick?: (h: Highlight, el: HTMLElement) => void;
}

function Segments({ block, highlights, activeHighlight, onHighlightClick }: Omit<Props, "author">) {
  const text = block.text;
  const leadEnd = block.type === "lead" ? nthSpace(text, 5) : 0;
  const cuts = new Set([0, text.length, leadEnd, ...highlights.flatMap((h) => [h.start, h.end])]);
  const points = [...cuts].filter((n) => n >= 0 && n <= text.length).sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [s, e] = [points[i], points[i + 1]];
    if (s === e) continue;
    const chunk = text.slice(s, e);
    const h = highlights.find((x) => x.start <= s && x.end >= e);
    const content = s < leadEnd ? <strong className="reading-block__lead-in">{chunk}</strong> : chunk;
    parts.push(
      h ? (
        <mark
          key={s}
          className={`text-highlight text-highlight--${h.color ?? "honey"} ${activeHighlight === h.groupId ? "is-active" : ""} ${h.note ? "has-note" : ""}`}
          data-highlight-id={h.id}
          tabIndex={0}
          role="button"
          aria-label={`Highlight${h.note ? " with note" : ""}: ${h.text.slice(0, 60)}`}
          onClick={(e) => onHighlightClick?.(h, e.currentTarget)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onHighlightClick?.(h, e.currentTarget))}
        >
          {content}
        </mark>
      ) : (
        <span key={s}>{content}</span>
      ),
    );
  }
  return <>{parts}</>;
}

function nthSpace(text: string, n: number) {
  let idx = -1;
  for (let i = 0; i < n; i++) {
    idx = text.indexOf(" ", idx + 1);
    if (idx < 0) return 0;
  }
  return idx;
}

export function ReadingContentBlock({ block, highlights, author, activeHighlight, onHighlightClick }: Props) {
  const seg = <Segments block={block} highlights={highlights} activeHighlight={activeHighlight} onHighlightClick={onHighlightClick} />;
  switch (block.type) {
    case "lead":
      return (
        <p className="reading-block reading-block--lead" data-block-id={block.id}>
          {seg}
        </p>
      );
    case "subheading":
      return (
        <h2 className="reading-block reading-block--subheading" data-block-id={block.id} id={block.id}>
          {seg}
        </h2>
      );
    case "quote":
      return <PullQuote block={block} author={author} highlights={highlights} activeHighlight={activeHighlight} onHighlightClick={onHighlightClick} />;
    case "break":
      return (
        <div className="reading-block reading-block--break" role="separator" aria-hidden="true">
          · · ·
        </div>
      );
    default:
      return (
        <p className="reading-block" data-block-id={block.id}>
          {seg}
        </p>
      );
  }
}

/** Penpot PullQuote — Fraunces Light Italic with the clay rule. */
export function PullQuote({ block, author, ...rest }: Props) {
  return (
    <figure className="pull-quote">
      <blockquote className="pull-quote__text" data-block-id={block.id}>
        “<Segments block={block} {...rest} />”
      </blockquote>
      <figcaption className="type-label-sm pull-quote__by">— {author}</figcaption>
    </figure>
  );
}
