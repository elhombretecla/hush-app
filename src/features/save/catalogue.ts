import type { Article } from "../../data/types";

const normalise = (url: string) =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^(www\.|mobile\.)/, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");

/** An article already in the library for this link, if any. */
export function findExisting(url: string, library: Article[]) {
  const key = normalise(url);
  return library.find((a) => normalise(a.sourceUrl ?? a.url) === key || normalise(a.url) === key);
}

export const looksLikeUrl = (s: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(s.trim());
