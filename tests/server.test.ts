// @vitest-environment node
// @ts-expect-error — plain ESM server modules
import { htmlToBlocks, readMetadata, parseDocument } from "../server/html.mjs";
// @ts-expect-error — plain ESM server modules
import { normaliseInput } from "../server/extract.mjs";
// @ts-expect-error — plain ESM server modules
import { safeFetch } from "../server/net.mjs";

const page = `<!doctype html><html lang="en"><head>
  <title>Fallback title</title>
  <meta property="og:title" content="On Keeping a Commonplace Book">
  <meta property="og:site_name" content="Notebook Review">
  <meta property="og:image" content="/covers/commonplace.jpg">
  <meta name="author" content="Claire Brooks">
  <meta property="article:published_time" content="2026-11-01T08:00:00Z">
</head><body></body></html>`;

describe("server extraction", () => {
  it("reads Open Graph metadata and resolves relative image URLs", () => {
    const meta = readMetadata(parseDocument(page, "https://notebookreview.com/essays/commonplace"), "https://notebookreview.com/essays/commonplace");
    expect(meta).toMatchObject({ title: "On Keeping a Commonplace Book", siteName: "Notebook Review", author: "Claire Brooks", image: "https://notebookreview.com/covers/commonplace.jpg", lang: "en" });
  });

  it("converts readable HTML into HUSH blocks", () => {
    const blocks = htmlToBlocks(
      `<div><p>First paragraph.</p><h2>A heading</h2><figure><img src="/a.jpg" width="800"><figcaption>Caption</figcaption></figure>
       <blockquote>Quoted line.</blockquote><ul><li>One</li><li>Two</li></ul><img src="/icon.png" width="16"><hr><p>End.</p></div>`,
      "https://example.org/post",
    );
    expect(blocks.map((b: { type: string }) => b.type)).toEqual(["lead", "subheading", "image", "quote", "paragraph", "paragraph", "break", "paragraph"]);
    expect(blocks[2]).toMatchObject({ src: "https://example.org/a.jpg", text: "Caption" });
    expect(blocks[4].text).toBe("• One");
  });

  it("normalises pasted links and strips tracking parameters", () => {
    expect(normaliseInput("example.org/read?utm_source=x&id=4#top").href).toBe("https://example.org/read?id=4");
    expect(() => normaliseInput("not a link")).toThrow(/doesn’t look complete/);
  });

  it("refuses to fetch private or local addresses", async () => {
    await expect(safeFetch("http://127.0.0.1:5173/")).rejects.toThrow(/isn’t reachable/);
    await expect(safeFetch("http://localhost/")).rejects.toThrow(/isn’t reachable/);
    await expect(safeFetch("file:///etc/passwd")).rejects.toThrow(/Only http/);
  });
});
