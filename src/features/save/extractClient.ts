import type { Article } from "../../data/types";

export class ExtractError extends Error {}

/** Asks the local HUSH server to read a link (see server/extract.mjs). */
export async function extractLink(url: string, signal?: AbortSignal): Promise<Article> {
  let res: Response;
  try {
    res = await fetch("/api/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ExtractError("The HUSH server isn’t running, so links can’t be read right now.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.article) throw new ExtractError(data.error ?? "We couldn’t read that link.");
  return data.article as Article;
}
