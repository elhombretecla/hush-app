// Social posts and media platforms. Each handler returns a partial capture or null when the URL is not theirs.
// Public, unauthenticated endpoints only.
import { fetchJson, safeFetch, decodeHtml } from "./net.mjs";
import { htmlToBlocks, parseDocument, readMetadata } from "./html.mjs";

const textBlocks = (text) =>
  text
    .split(/\n{2,}/)
    .map((t) => t.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .map((t) => ({ type: "paragraph", text: t }));
const titleFrom = (text, fallback) => {
  const t = (text || "").replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  if (!t) return fallback;
  const firstSentence = t.split(/(?<=[.!?])\s/)[0];
  const base = firstSentence.length <= 90 ? firstSentence : t.slice(0, 88).replace(/\s+\S*$/, "") + "…";
  return base;
};

// ---------- X / Twitter (via the public FxTwitter API) ----------
async function twitter(url) {
  if (!/^(www\.|mobile\.)?(twitter|x)\.com$/.test(url.hostname)) return null;
  const m = /\/([^/]+)\/status(?:es)?\/(\d+)/.exec(url.pathname);
  if (!m) return null;
  const data = await fetchJson(`https://api.fxtwitter.com/${m[1]}/status/${m[2]}`);
  const t = data.tweet;
  if (!t) return null;
  const photos = t.media?.photos?.map((p) => p.url) ?? [];
  const videoThumb = t.media?.videos?.[0]?.thumbnail_url;
  const body = textBlocks(t.text || "");
  photos.forEach((src) => body.push({ type: "image", text: "", src }));
  if (t.quote) body.push({ type: "quote", text: `${t.quote.author?.name}: ${t.quote.text}` });
  return {
    type: "Post",
    platform: "X",
    title: titleFrom(t.text, `Post by @${t.author?.screen_name}`),
    author: t.author?.name || `@${t.author?.screen_name}`,
    publication: `@${t.author?.screen_name} on X`,
    excerpt: (t.text || "").slice(0, 280),
    image: photos[0] ?? videoThumb,
    published: t.created_at,
    body,
    canonical: t.url ?? url.href,
  };
}

// ---------- Bluesky ----------
async function bluesky(url) {
  if (url.hostname !== "bsky.app") return null;
  const m = /\/profile\/([^/]+)\/post\/([^/?#]+)/.exec(url.pathname);
  if (!m) return null;
  const did = m[1].startsWith("did:") ? m[1] : (await fetchJson(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(m[1])}`)).did;
  const data = await fetchJson(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=0&uri=${encodeURIComponent(`at://${did}/app.bsky.feed.post/${m[2]}`)}`);
  const post = data.thread?.post;
  if (!post) return null;
  const embed = post.embed ?? {};
  const images = embed.images ?? embed.media?.images ?? [];
  const body = textBlocks(post.record?.text || "");
  images.forEach((i) => body.push({ type: "image", text: i.alt || "", src: i.fullsize }));
  if (embed.external) body.push({ type: "quote", text: `${embed.external.title} — ${embed.external.uri}` });
  return {
    type: "Post",
    platform: "Bluesky",
    title: titleFrom(post.record?.text, `Post by @${post.author.handle}`),
    author: post.author.displayName || `@${post.author.handle}`,
    publication: `@${post.author.handle} on Bluesky`,
    excerpt: (post.record?.text || "").slice(0, 280),
    image: images[0]?.fullsize ?? embed.external?.thumb ?? embed.thumbnail,
    published: post.record?.createdAt,
    body,
  };
}

// ---------- Mastodon (any instance) ----------
async function mastodon(url) {
  const m = /^\/@[^/]+\/(\d+)$/.exec(url.pathname) ?? /^\/users\/[^/]+\/statuses\/(\d+)$/.exec(url.pathname);
  if (!m) return null;
  let s;
  try {
    s = await fetchJson(`${url.origin}/api/v1/statuses/${m[1]}`, { timeout: 8000 });
  } catch {
    return null; // not a Mastodon server after all
  }
  if (!s?.content) return null;
  const html = s.content;
  const text = parseDocument(`<body>${html}</body>`, url.href).body.textContent;
  const body = htmlToBlocks(html, url.href);
  s.media_attachments?.filter((a) => a.type === "image").forEach((a) => body.push({ type: "image", text: a.description || "", src: a.url }));
  return {
    type: "Post",
    platform: "Mastodon",
    title: titleFrom(text, `Post by @${s.account.acct}`),
    author: s.account.display_name || s.account.username,
    publication: `@${s.account.acct} on Mastodon`,
    excerpt: text.slice(0, 280),
    image: s.media_attachments?.find((a) => a.type === "image")?.url ?? s.media_attachments?.[0]?.preview_url ?? s.card?.image,
    published: s.created_at,
    body,
  };
}

// ---------- Reddit ----------
async function reddit(url) {
  if (!/(^|\.)reddit\.com$/.test(url.hostname) || !/\/comments\//.test(url.pathname)) return null;
  const jsonUrl = `https://old.reddit.com${url.pathname.replace(/\/$/, "")}.json?raw_json=1`;
  const data = await fetchJson(jsonUrl, { browserLike: true });
  const p = data?.[0]?.data?.children?.[0]?.data;
  if (!p) return null;
  const body = p.selftext_html ? htmlToBlocks(p.selftext_html, url.href) : textBlocks(p.selftext || "");
  const image = p.preview?.images?.[0]?.source?.url ?? (/\.(jpe?g|png|gif|webp)$/i.test(p.url) ? p.url : undefined);
  if (image) body.unshift({ type: "image", text: "", src: image });
  if (!p.is_self && p.url && !image) body.push({ type: "quote", text: p.url });
  return {
    type: "Post",
    platform: "Reddit",
    title: p.title,
    author: `u/${p.author}`,
    publication: `${p.subreddit_name_prefixed} on Reddit`,
    excerpt: (p.selftext || p.title).slice(0, 280),
    image,
    published: new Date(p.created_utc * 1000).toISOString(),
    body,
  };
}

// ---------- YouTube / Vimeo (oEmbed + page metadata) ----------
async function video(url) {
  const yt = /(^|\.)youtube\.com$|^youtu\.be$/.test(url.hostname);
  const vimeo = /(^|\.)vimeo\.com$/.test(url.hostname);
  if (!yt && !vimeo) return null;
  const endpoint = yt ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url.href)}` : `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url.href)}`;
  const o = await fetchJson(endpoint);
  let description = "";
  let minutes;
  try {
    const { body, res } = await safeFetch(url.href, { accept: "text/html", browserLike: true });
    const meta = readMetadata(parseDocument(decodeHtml(body, res.headers.get("content-type") ?? ""), url.href), url.href);
    description = meta.description;
    const d = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(meta.duration ?? "");
    if (d) minutes = Math.max(1, Number(d[1] || 0) * 60 + Number(d[2] || 0) + Math.round(Number(d[3] || 0) / 60));
  } catch {
    /* oEmbed alone is enough */
  }
  if (!minutes && o.duration) minutes = Math.max(1, Math.round(o.duration / 60));
  return {
    type: "Video",
    platform: yt ? "YouTube" : "Vimeo",
    title: o.title,
    author: o.author_name,
    publication: `${o.author_name} on ${yt ? "YouTube" : "Vimeo"}`,
    excerpt: description || `A video by ${o.author_name}.`,
    image: o.thumbnail_url?.replace(/hqdefault/, "maxresdefault"),
    imageFallback: o.thumbnail_url,
    minutes,
    body: [...(description ? textBlocks(description) : [{ type: "paragraph", text: `A video by ${o.author_name}. Open the original to watch it.` }])],
  };
}

export const socialHandlers = [twitter, bluesky, reddit, video, mastodon];

/** Hosts whose generic page metadata should be treated as a social post. */
export const SOCIAL_HOSTS = /(^|\.)(threads\.net|threads\.com|instagram\.com|linkedin\.com|facebook\.com|tiktok\.com|tumblr\.com)$/;
