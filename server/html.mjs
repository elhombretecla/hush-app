// Generic web pages: metadata (Open Graph, Twitter cards, JSON-LD) + readable body via Mozilla Readability,
// converted to HUSH content blocks (lead · paragraph · subheading · quote · image · break).
import { Readability } from "@mozilla/readability";
import { JSDOM, VirtualConsole } from "jsdom";

const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const virtualConsole = new VirtualConsole(); // swallow CSS/script parse noise from arbitrary pages

export function parseDocument(html, url) {
  return new JSDOM(html, { url, virtualConsole }).window.document;
}

function jsonLd(doc) {
  const out = [];
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(s.textContent);
      const items = Array.isArray(data) ? data : data["@graph"] ?? [data];
      out.push(...items.filter((i) => i && typeof i === "object"));
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return out;
}

const firstString = (v) => (typeof v === "string" ? v : Array.isArray(v) ? firstString(v[0]) : v && typeof v === "object" ? firstString(v.url ?? v.name ?? v.contentUrl) : undefined);

export function readMetadata(doc, pageUrl) {
  const meta = (...names) => {
    for (const n of names) {
      const el = doc.querySelector(`meta[property="${n}"], meta[name="${n}"], meta[itemprop="${n}"]`);
      const v = el?.getAttribute("content");
      if (v && v.trim()) return v.trim();
    }
    return undefined;
  };
  const ld = jsonLd(doc);
  const ldArticle = ld.find((i) => /Article|BlogPosting|NewsArticle|Report|VideoObject|PodcastEpisode/i.test(String(i["@type"]))) ?? ld[0] ?? {};
  const abs = (u) => {
    try {
      return u ? new URL(u, pageUrl).href : undefined;
    } catch {
      return undefined;
    }
  };
  const ldAuthor = Array.isArray(ldArticle.author) ? ldArticle.author[0] : ldArticle.author;
  return {
    title: clean(meta("og:title", "twitter:title") ?? ldArticle.headline ?? doc.querySelector("title")?.textContent),
    description: clean(meta("og:description", "twitter:description", "description") ?? ldArticle.description),
    siteName: clean(meta("og:site_name", "application-name") ?? (typeof ldArticle.publisher === "object" ? ldArticle.publisher?.name : undefined)),
    author: clean(meta("author", "article:author", "twitter:creator") ?? (typeof ldAuthor === "string" ? ldAuthor : ldAuthor?.name)),
    image: abs(meta("og:image:secure_url", "og:image", "og:image:url", "twitter:image", "twitter:image:src", "thumbnailUrl") ?? doc.querySelector('link[rel="image_src"]')?.getAttribute("href") ?? firstString(ldArticle.image) ?? firstString(ldArticle.thumbnailUrl)),
    ogType: meta("og:type") ?? "",
    published: meta("article:published_time", "datePublished") ?? ldArticle.datePublished,
    duration: meta("duration", "video:duration") ?? ldArticle.duration,
    lang: doc.documentElement.getAttribute("lang") ?? undefined,
  };
}

/** Readable article HTML → HUSH blocks. Images keep their absolute source URL. */
export function htmlToBlocks(html, baseUrl) {
  const doc = new JSDOM(`<body>${html}</body>`, { url: baseUrl, virtualConsole }).window.document;
  const blocks = [];
  const push = (type, text, extra = {}) => {
    const t = clean(text);
    if (type !== "image" && type !== "break" && !t) return;
    if (type === "break" && blocks.at(-1)?.type === "break") return;
    blocks.push({ type, text: type === "break" ? "· · ·" : t, ...extra });
  };
  const imgSrc = (img) => {
    const raw = img.getAttribute("src") || img.getAttribute("data-src") || img.getAttribute("srcset")?.split(",").pop()?.trim().split(" ")[0];
    if (!raw || raw.startsWith("data:")) return undefined;
    try {
      return new URL(raw, baseUrl).href;
    } catch {
      return undefined;
    }
  };
  const pushImage = (img, caption) => {
    const src = imgSrc(img);
    const w = Number(img.getAttribute("width") || 0);
    if (!src || (w && w < 120)) return; // skip icons, avatars and tracking pixels
    if (blocks.some((b) => b.src === src)) return;
    push("image", caption || img.getAttribute("alt") || "", { src });
  };
  const walk = (node) => {
    for (const el of node.children) {
      const tag = el.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) push("subheading", el.textContent);
      else if (tag === "p") {
        const imgs = el.querySelectorAll("img");
        if (imgs.length && !clean(el.textContent)) imgs.forEach((i) => pushImage(i));
        else push("paragraph", el.textContent);
      } else if (tag === "blockquote") push("quote", el.textContent);
      else if (tag === "figure") {
        const img = el.querySelector("img");
        if (img) pushImage(img, clean(el.querySelector("figcaption")?.textContent));
        else walk(el);
      } else if (tag === "img") pushImage(el);
      else if (tag === "ul" || tag === "ol") [...el.querySelectorAll(":scope > li")].forEach((li, i) => push("paragraph", `${tag === "ol" ? `${i + 1}.` : "•"} ${li.textContent}`));
      else if (tag === "pre") push("paragraph", el.textContent);
      else if (tag === "hr") push("break", "");
      else if (["script", "style", "noscript", "iframe", "svg", "button", "form", "nav", "aside", "footer"].includes(tag)) continue;
      else if (el.children.length) walk(el);
      else push("paragraph", el.textContent);
      if (blocks.length >= 600) return;
    }
  };
  walk(doc.body);
  while (blocks.length && blocks[0].type === "break") blocks.shift();
  const firstText = blocks.findIndex((b) => b.type === "paragraph");
  if (firstText >= 0 && firstText < 4) blocks[firstText].type = "lead";
  return blocks;
}

export function readability(doc) {
  const clone = doc.cloneNode(true);
  const parsed = new Readability(clone, { charThreshold: 200, keepClasses: false }).parse();
  return parsed && parsed.textContent && clean(parsed.textContent).length > 280 ? parsed : null;
}

/** Largest-looking content image on the page, used when there is no og:image. */
export function firstContentImage(doc, baseUrl) {
  const candidates = [...doc.querySelectorAll("article img, main img, img")];
  for (const img of candidates) {
    const src = img.getAttribute("src") || img.getAttribute("data-src");
    if (!src || src.startsWith("data:") || /logo|avatar|icon|sprite|pixel|emoji/i.test(src)) continue;
    const w = Number(img.getAttribute("width") || 0);
    if (w && w < 200) continue;
    try {
      return new URL(src, baseUrl).href;
    } catch {
      /* skip */
    }
  }
  return undefined;
}

export const wordCount = (blocks) => blocks.reduce((n, b) => n + (b.type === "image" ? 0 : b.text.split(/\s+/).filter(Boolean).length), 0);
