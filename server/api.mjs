// /api routes, usable as Connect middleware (Vite dev server) or from the production server.
import { extract } from "./extract.mjs";
import { cacheImage, readMedia } from "./media.mjs";
import { readFile } from "node:fs/promises";

const send = (res, status, body, type = "application/json") => {
  res.statusCode = status;
  res.setHeader("content-type", type);
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 20_000) throw new Error("Body too large");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export async function apiHandler(req, res, next) {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith("/api/")) return next?.();
  try {
    if (url.pathname === "/api/extract" && req.method === "POST") {
      const { url: link } = await readBody(req);
      const article = await extract(link);
      return send(res, 200, { article });
    }
    if (url.pathname === "/api/image" && req.method === "GET") {
      const src = url.searchParams.get("src");
      if (!src || !/^https?:\/\//.test(src)) return send(res, 400, { error: "Missing image" });
      const { file, type } = await cacheImage(src);
      res.setHeader("cache-control", "public, max-age=31536000, immutable");
      return send(res, 200, await readFile(file), type);
    }
    if (url.pathname.startsWith("/api/media/") && req.method === "GET") {
      const media = await readMedia(decodeURIComponent(url.pathname.slice("/api/media/".length)));
      if (!media) return send(res, 404, { error: "Not found" });
      res.setHeader("cache-control", "public, max-age=31536000, immutable");
      return send(res, 200, media.data, media.type);
    }
    return send(res, 404, { error: "Not found" });
  } catch (e) {
    const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
    if (status === 500) console.error("[hush] api error", e);
    return send(res, status, { error: e.status ? e.message : "Something went wrong while reading that link" });
  }
}
