import type { Highlight, HighlightColor } from "../../data/types";

/** Character offset of (node, offset) within a block element's plain text. */
export function textOffset(block: Element, node: Node, offset: number): number {
  const r = document.createRange();
  r.setStart(block, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

/** Pull-quote blocks render typographic quote marks around the text; strip them from offsets. */
const blockText = (el: Element) => el.textContent ?? "";
const quoteAdjust = (el: Element) => (el.tagName === "BLOCKQUOTE" ? 1 : 0);

export interface SelectionSegment {
  blockId: string;
  start: number;
  end: number;
  text: string;
}

/**
 * Turns the current DOM selection into per-block segments with stable offsets.
 * Works across several paragraphs: each touched block becomes one segment.
 */
export function segmentsFromSelection(root: HTMLElement, selection: Selection | null): SelectionSegment[] {
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return [];
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return [];
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block-id]"));
  const segments: SelectionSegment[] = [];
  for (const block of blocks) {
    if (!range.intersectsNode(block)) continue;
    const adj = quoteAdjust(block);
    const full = blockText(block);
    const len = full.length - adj * 2;
    const startsHere = block.contains(range.startContainer);
    const endsHere = block.contains(range.endContainer);
    let start = startsHere ? textOffset(block, range.startContainer, range.startOffset) - adj : 0;
    let end = endsHere ? textOffset(block, range.endContainer, range.endOffset) - adj : len;
    start = Math.max(0, Math.min(len, start));
    end = Math.max(0, Math.min(len, end));
    const text = full.slice(start + adj, end + adj);
    // Trim surrounding whitespace so highlights hug the words.
    const lead = text.length - text.trimStart().length;
    const trail = text.length - text.trimEnd().length;
    if (end - start - lead - trail <= 0) continue;
    segments.push({ blockId: block.dataset.blockId!, start: start + lead, end: end - trail, text: text.trim() });
  }
  return segments;
}

export function highlightsFromSegments(articleId: string, segments: SelectionSegment[], color: HighlightColor, note?: string): Highlight[] {
  const groupId = `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();
  return segments.map((s, i) => ({ id: `${groupId}-${i}`, groupId, articleId, blockId: s.blockId, start: s.start, end: s.end, text: s.text, color, note: i === 0 ? note : undefined, createdAt }));
}
