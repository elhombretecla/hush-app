// Production server: serves the built app from dist/ and the /api routes.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { apiHandler } from "./api.mjs";

const DIST = resolve("dist");
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json" };

createServer(async (req, res) => {
  if (req.url.startsWith("/api/")) return apiHandler(req, res);
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, path);
  if (!(await stat(file).catch(() => null))?.isFile()) file = join(DIST, "index.html"); // client-side routes
  res.setHeader("content-type", TYPES[extname(file)] ?? "application/octet-stream");
  if (file.includes("/assets/")) res.setHeader("cache-control", "public, max-age=31536000, immutable");
  res.end(await readFile(file));
}).listen(PORT, () => console.log(`hush. running at http://localhost:${PORT}`));
