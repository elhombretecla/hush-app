// Outbound HTTP for the extractor: http(s) only, no private/loopback targets, size + time limits,
// redirects followed manually so every hop is checked.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const USER_AGENT = "Mozilla/5.0 (compatible; HushReader/1.0; +https://hush.app)";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

function isPrivate(ip) {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v.startsWith("::ffff:10.") || v.startsWith("::ffff:192.168.");
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

export class FetchError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function assertPublic(url) {
  if (!/^https?:$/.test(url.protocol)) throw new FetchError("Only http and https links can be saved", 400);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new FetchError("That address isn’t reachable from here", 400);
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => {
    throw new FetchError("We couldn’t find that site", 404);
  });
  if (addresses.some((a) => isPrivate(a.address))) throw new FetchError("That address isn’t reachable from here", 400);
}

/** fetch() with SSRF guard, redirect checks, timeout and a body size cap. Returns { url, res, body: Buffer }. */
export async function safeFetch(input, { accept = "*/*", maxBytes = 6_000_000, timeout = 15_000, browserLike = false, headers = {} } = {}) {
  let url = new URL(input);
  for (let hop = 0; hop < 6; hop++) {
    await assertPublic(url);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    let res;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": browserLike ? BROWSER_UA : USER_AGENT, accept, "accept-language": "en,es;q=0.8", ...headers },
      });
    } catch (e) {
      clearTimeout(timer);
      throw new FetchError(e.name === "AbortError" ? "The site took too long to answer" : "We couldn’t reach that site", 502);
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      clearTimeout(timer);
      url = new URL(res.headers.get("location"), url);
      continue;
    }
    try {
      if (!res.ok) throw new FetchError(`The site answered ${res.status}`, res.status === 404 ? 404 : 502);
      const declared = Number(res.headers.get("content-length") || 0);
      if (declared > maxBytes) throw new FetchError("That page is too large to save", 413);
      const reader = res.body.getReader();
      const chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > maxBytes) {
          ctrl.abort();
          throw new FetchError("That page is too large to save", 413);
        }
        chunks.push(value);
      }
      return { url, res, body: Buffer.concat(chunks) };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new FetchError("Too many redirects", 508);
}

export async function fetchJson(url, opts) {
  const { body } = await safeFetch(url, { accept: "application/json", ...opts });
  return JSON.parse(body.toString("utf8"));
}

/** Decodes an HTML response honouring the declared or <meta> charset. */
export function decodeHtml(body, contentType = "") {
  let charset = /charset=([^;]+)/i.exec(contentType)?.[1];
  if (!charset) charset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(body.subarray(0, 4096).toString("latin1"))?.[1];
  try {
    return new TextDecoder(charset?.trim() || "utf-8").decode(body);
  } catch {
    return new TextDecoder("utf-8").decode(body);
  }
}
