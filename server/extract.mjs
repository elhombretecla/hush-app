// URL → HUSH article. Social platforms use their public APIs; everything else goes through
// page metadata + Readability. Thumbnails: metadata image → first content image → screenshot.
import { createHash } from "node:crypto";
import { decodeHtml, FetchError, safeFetch } from "./net.mjs";
import { firstContentImage, htmlToBlocks, parseDocument, readability, readMetadata, wordCount } from "./html.mjs";
import { SOCIAL_HOSTS, socialHandlers } from "./social.mjs";
import { isUsableThumbnail, screenshot } from "./media.mjs";

const NEWSLETTER_HOSTS = /(substack\.com|buttondown\.(email|com)|beehiiv\.com|ghost\.io|mailchi\.mp|revue\.co|tinyletter\.com)$/;
const AUDIO_HOSTS = /(open\.spotify\.com|podcasts\.apple\.com|overcast\.fm|pocketcasts\.com|soundcloud\.com)$/;
const TONES = ["Moss", "Clay", "Honey", "Ink", "Paper"];

const initials = (name) =>
  (name || "?")
    .replace(/^@/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
const hostLabel = (host) => host.replace(/^www\./, "");
const clip = (text, max) => (text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, "") + "…");

export function normaliseInput(input) {
  const raw = String(input || "").trim();
  if (!raw) throw new FetchError("Paste a link first", 400);
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    throw new FetchError("That link doesn’t look complete — check for a missing .com", 400);
  }
  if (!url.hostname.includes(".")) throw new FetchError("That link doesn’t look complete — check for a missing .com", 400);
  for (const p of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid|mc_|ref_src|s$|t$)/.test(p)) url.searchParams.delete(p);
  url.hash = "";
  return url;
}

async function generic(url) {
  const { url: finalUrl, res, body } = await safeFetch(url.href, { accept: "text/html,application/xhtml+xml", browserLike: true });
  const type = res.headers.get("content-type") ?? "";
  if (/^image\//.test(type)) return { type: "Article", title: decodeURIComponent(finalUrl.pathname.split("/").pop() || "Image"), image: finalUrl.href, body: [{ type: "image", text: "", src: finalUrl.href }], excerpt: "An image saved from the web." };
  if (!/html|xml/.test(type)) throw new FetchError("That link isn’t a web page HUSH can read yet", 415);
  const html = decodeHtml(body, type);
  const doc = parseDocument(html, finalUrl.href);
  const meta = readMetadata(doc, finalUrl.href);
  const article = readability(parseDocument(html, finalUrl.href));
  const blocks = article ? htmlToBlocks(article.content, finalUrl.href) : [];
  const contentImage = blocks.find((b) => b.type === "image")?.src ?? firstContentImage(doc, finalUrl.href);
  const host = finalUrl.hostname;
  const isPost = SOCIAL_HOSTS.test(host);
  const kind = isPost ? "Post" : /video/.test(meta.ogType) ? "Video" : /music|podcast|audio/.test(meta.ogType) || AUDIO_HOSTS.test(host) ? "Audio" : NEWSLETTER_HOSTS.test(host) ? "Newsletter" : "Article";
  return {
    type: kind,
    title: article?.title?.trim() || meta.title || hostLabel(host),
    author: meta.author || article?.byline?.trim() || undefined,
    publication: meta.siteName || article?.siteName || hostLabel(host),
    excerpt: meta.description || article?.excerpt?.trim() || blocks.find((b) => b.type !== "image")?.text?.slice(0, 220) || "",
    image: meta.image || contentImage,
    imageFrom: meta.image ? "metadata" : contentImage ? "content" : undefined,
    published: meta.published,
    lang: meta.lang,
    body: blocks.length ? blocks : meta.description ? [{ type: "lead", text: meta.description }] : [],
    canonical: finalUrl.href,
    readable: !!article,
  };
}

/** Main entry: returns a fully-formed HUSH Article (see src/data/types.ts). */
export async function extract(input) {
  const url = normaliseInput(input);
  let capture = null;
  for (const handler of socialHandlers) {
    try {
      capture = await handler(url);
    } catch (e) {
      console.warn(`[hush] ${handler.name} failed for ${url.href}: ${e.message}`);
    }
    if (capture) break;
  }
  if (!capture) capture = await generic(url);

  const pageUrl = capture.canonical ?? url.href;
  let image = capture.image;
  let imageFrom = capture.image ? capture.imageFrom ?? "metadata" : undefined;
  // Metadata images are trusted a little more than random content images, but both must be real pictures.
  if (image && !(await isUsableThumbnail(image, imageFrom === "metadata" ? { minWidth: 200, minHeight: 100, maxRatio: 5 } : undefined))) {
    const alt = capture.imageFallback ?? capture.body.find((b) => b.type === "image" && b.src !== image)?.src;
    image = alt && (await isUsableThumbnail(alt)) ? alt : undefined;
    imageFrom = image ? "content" : undefined;
  }
  // Last resort: a screenshot of the first viewport (not for X, which only shows a login wall).
  if (!image && capture.platform !== "X") {
    const shot = await screenshot(pageUrl);
    if (shot) {
      image = `/api/media/${shot}`;
      imageFrom = "screenshot";
    }
  }

  const id = "saved-" + createHash("sha1").update(pageUrl).digest("hex").slice(0, 12);
  const words = wordCount(capture.body);
  const minutes = capture.minutes ?? (capture.type === "Post" ? Math.max(1, Math.round(words / 230)) : Math.max(1, Math.round(words / 230)));
  const body = capture.body.map((b, i) => ({ id: `${id}-${i + 1}`, ...b }));
  if (body.length && body[0].type === "paragraph" && capture.type !== "Post") body[0].type = "lead";
  const author = capture.author || capture.publication || hostLabel(url.hostname);
  let title = capture.title || hostLabel(url.hostname);
  // Blocked or app-shell pages often only expose the site name; fall back to the URL slug.
  const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "").replace(/\.[a-z]+$/, "");
  if (/[a-z]{3,}[-_][a-z]{3,}/i.test(slug) && (title.toLowerCase() === hostLabel(url.hostname).split(".")[0] || title.length < 10)) {
    title = slug.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  }

  return {
    id,
    title,
    dek: capture.excerpt && capture.excerpt !== title ? clip(capture.excerpt, 220) : "",
    author,
    authorInitials: initials(author),
    publication: capture.publication || hostLabel(url.hostname),
    type: capture.type,
    platform: capture.platform,
    topics: [],
    minutes,
    cover: TONES[parseInt(id.slice(-2), 16) % TONES.length],
    image,
    imageFrom,
    excerpt: clip(capture.excerpt || "", 320),
    url: pageUrl.replace(/^https?:\/\//, ""),
    sourceUrl: pageUrl,
    savedAt: new Date().toISOString(),
    publishedAt: capture.published,
    body,
    readable: capture.readable ?? body.length > 0,
  };
}
