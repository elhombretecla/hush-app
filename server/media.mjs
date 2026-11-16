// Local media cache: proxied images (so covers keep working when origins block hotlinking)
// and first-viewport screenshots used as a last-resort thumbnail.
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { imageSize } from "image-size";
import { safeFetch } from "./net.mjs";

export const MEDIA_DIR = resolve(process.env.HUSH_DATA_DIR ?? ".data", "media");
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg" };
const TYPE = Object.fromEntries(Object.entries(EXT).map(([t, e]) => [e, t]));
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 20);

/** Downloads (once) and returns { file, type } for a remote image. */
export async function cacheImage(src) {
  await mkdir(MEDIA_DIR, { recursive: true });
  const key = "img-" + hash(src);
  for (const ext of Object.values(EXT)) {
    const file = join(MEDIA_DIR, `${key}.${ext}`);
    if (await stat(file).catch(() => null)) return { file, type: TYPE[ext] };
  }
  const { res, body } = await safeFetch(src, { accept: "image/avif,image/webp,image/*", maxBytes: 12_000_000, browserLike: true });
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!EXT[type]) throw new Error("Not an image");
  const file = join(MEDIA_DIR, `${key}.${EXT[type]}`);
  await writeFile(file, body);
  return { file, type };
}

/** True when a remote image is big enough to work as a reading thumbnail (not a logo, icon or title strip). */
export async function isUsableThumbnail(src, { minWidth = 320, minHeight = 160, maxRatio = 4 } = {}) {
  try {
    const { file } = await cacheImage(src);
    const { width = 0, height = 0 } = imageSize(await readFile(file));
    return width >= minWidth && height >= minHeight && width / height <= maxRatio && height / width <= maxRatio;
  } catch {
    return false;
  }
}

export async function readMedia(name) {
  if (!/^[\w.-]+$/.test(name)) return null;
  const file = join(MEDIA_DIR, name);
  const data = await readFile(file).catch(() => null);
  return data && { data, type: TYPE[name.split(".").pop()] ?? "application/octet-stream" };
}

let browserPromise = null;
async function browser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      const env = process.env.HUSH_CHROMIUM_LD_LIBRARY_PATH ? { ...process.env, LD_LIBRARY_PATH: process.env.HUSH_CHROMIUM_LD_LIBRARY_PATH } : undefined;
      return chromium.launch({ env });
    })().catch((e) => {
      browserPromise = null;
      throw e;
    });
  }
  return browserPromise;
}

/**
 * Screenshot of the first viewport of a page, saved as JPEG. Returns the media file name, or null when
 * no headless browser is available (Playwright + Chromium are optional).
 */
export async function screenshot(url) {
  try {
    await mkdir(MEDIA_DIR, { recursive: true });
    const name = `shot-${hash(url)}.jpg`;
    if (await stat(join(MEDIA_DIR, name)).catch(() => null)) return name;
    const b = await browser();
    const page = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(MEDIA_DIR, name), type: "jpeg", quality: 72 });
    } finally {
      await page.close();
    }
    return name;
  } catch (e) {
    console.warn(`[hush] screenshot unavailable for ${url}: ${e.message.split("\n")[0]}`);
    return null;
  }
}
