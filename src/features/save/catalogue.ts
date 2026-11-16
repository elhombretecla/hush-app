import { articles } from "../../data/articles";
import type { Article } from "../../data/types";

/**
 * Local demo catalogue. HUSH has no metadata extraction service in this build: links that match a
 * known sample resolve here; anything else is saved with details the reader types in.
 */
export const sampleNotYetSaved: Article[] = [
  {
    id: "commonplace-book",
    title: "On Keeping a Commonplace Book",
    dek: "A notebook for other people's sentences.",
    author: "Claire Brooks",
    authorInitials: "CB",
    publication: "Notebook Review",
    type: "Article",
    topics: ["Note-taking", "Memory"],
    minutes: 7,
    cover: "Paper",
    excerpt: "For three centuries readers kept a book of other people's sentences. The habit is worth reviving — slowly, by hand, one quotation at a time.",
    url: "notebookreview.com/commonplace-book",
    savedAt: "2026-11-16",
    body: [
      { id: "commonplace-book-1", type: "lead", text: "For three centuries readers kept a book of other people's sentences. The habit is worth reviving — slowly, by hand, one quotation at a time." },
      { id: "commonplace-book-2", type: "paragraph", text: "A commonplace book is not a diary and not a database. It is closer to a garden: a place where borrowed lines are replanted next to each other until they start a conversation." },
      { id: "commonplace-book-3", type: "paragraph", text: "The rule I keep is simple. Copy the sentence out in full, write the date, and add one line of your own underneath. Months later, that one line is usually the most interesting thing on the page." },
    ],
  },
  {
    id: "unhurried-lunch",
    title: "The Art of the Unhurried Lunch",
    dek: "Forty minutes, one plate, no screen.",
    author: "Ellen Park",
    authorInitials: "EP",
    publication: "Fieldnotes",
    type: "Article",
    topics: ["Slow living", "Habits"],
    minutes: 5,
    cover: "Clay",
    excerpt: "Forty minutes, one plate, no screen. A small experiment in eating lunch as if it were part of the day rather than a gap in it.",
    url: "fieldnotes.substack.com/unhurried-lunch",
    savedAt: "2026-11-16",
    body: [
      { id: "unhurried-lunch-1", type: "lead", text: "Forty minutes, one plate, no screen. A small experiment in eating lunch as if it were part of the day rather than a gap in it." },
      { id: "unhurried-lunch-2", type: "paragraph", text: "The first few days were uncomfortable in a way I did not expect. Without a screen, lunch had edges. By Friday those edges felt like the point." },
    ],
  },
];

const normalise = (url: string) => url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

export function lookup(url: string, saved: Article[]): { status: "known"; article: Article } | { status: "in-library"; article: Article } | { status: "unknown" } {
  const key = normalise(url);
  const owned = [...saved, ...articles].find((a) => normalise(a.url) === key);
  if (owned) return { status: "in-library", article: owned };
  const known = sampleNotYetSaved.find((a) => normalise(a.url) === key);
  return known ? { status: "known", article: known } : { status: "unknown" };
}

export const looksLikeUrl = (s: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(s.trim());
