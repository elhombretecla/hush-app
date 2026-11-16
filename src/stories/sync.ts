import manifest from "./penpot-components.json";

/** Penpot components with no code counterpart, and why. Anything else missing a story fails the sync test. */
export const PENPOT_ONLY: Record<string, string> = {
  StatusBar: "Phone status bar drawn in the mobile mockups; on the web the device shows its own.",
  Radio: "No plain radio list in the app — single choices use Segment, ThemeOption and DurationOption (role=radio).",
  Skeleton: "The library is local, so lists render at once; the only wait (capturing a link) uses LoadingState.",
  Tooltip: "Icon buttons carry accessible labels instead of hover tooltips.",
  ErrorMessage: "Errors show inline (FormError) or as an error Toast; the app has no full-page error view yet.",
};

/** Variant differences worth knowing about between Penpot and code. */
export const VARIANT_NOTES: Record<string, string> = {
  Toggle: "Penpot has State = Disabled; the app never disables a toggle, so the code has no disabled prop.",
  ContentTypeBadge: "Code adds Type = Post for social posts captured from X, Bluesky, Mastodon or Reddit.",
  ReadingContentBlock: "Code adds Type = Image for figures inside captured articles.",
  TextHighlight: "Code adds the three HighlightActionBar colours (honey · moss · clay).",
  ArticleCard: "Code shows a captured thumbnail when there is one; ContentCover is the fallback.",
};

export type PenpotEntry = { name: string; variants?: Record<string, string[]> };
export const penpotPages = manifest.pages as { page: string; components: PenpotEntry[] }[];
export const penpotBrand = manifest.brand;

type StoryExport = { name?: string; parameters?: { penpot?: string[]; codeOnly?: string; penpotBrand?: string[] } };
export type StoryModule = Record<string, unknown> & { default: { title: string; parameters?: StoryExport["parameters"] } };

// Same rules Storybook uses to build story ids (@storybook/csf sanitize).
const sanitize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
const storyId = (title: string, exportName: string) => `${sanitize(title)}--${sanitize(exportName.replace(/([a-z])([A-Z])/g, "$1 $2"))}`;

export interface StoryRef {
  id: string;
  title: string;
  story: string;
}

/** Penpot component name → stories that render it, plus code-only stories. */
export function collectStories(modules: Record<string, StoryModule>) {
  const byComponent = new Map<string, StoryRef[]>();
  const codeOnly: (StoryRef & { note: string })[] = [];
  const brand = new Set<string>();
  const add = (name: string, ref: StoryRef) => byComponent.set(name, [...(byComponent.get(name) ?? []), ref]);
  for (const mod of Object.values(modules)) {
    const meta = mod.default;
    const order = (mod.__namedExportsOrder as string[] | undefined) ?? Object.keys(mod);
    meta.parameters?.penpotBrand?.forEach((b) => brand.add(b));
    for (const exportName of order) {
      const s = mod[exportName] as StoryExport | undefined;
      if (exportName === "default" || !s || typeof s !== "object" || Array.isArray(s)) continue;
      const ref = { id: storyId(meta.title, exportName), title: meta.title, story: s.name ?? exportName };
      if (s.parameters?.codeOnly) codeOnly.push({ ...ref, note: s.parameters.codeOnly });
      // A story's own mapping wins; otherwise the file-level (meta) mapping applies, except to code-only stories.
      const names = s.parameters?.penpot ?? (s.parameters?.codeOnly ? [] : meta.parameters?.penpot ?? []);
      names.forEach((n) => add(n, ref));
    }
  }
  return { byComponent, codeOnly, brand };
}

export function syncReport(modules: Record<string, StoryModule>) {
  const { byComponent, codeOnly, brand } = collectStories(modules);
  const known = new Set(penpotPages.flatMap((p) => p.components.map((c) => c.name)));
  const pages = penpotPages.map((p) => ({
    page: p.page,
    rows: p.components.map((c) => ({
      ...c,
      stories: byComponent.get(c.name) ?? [],
      status: byComponent.has(c.name) ? ("both" as const) : PENPOT_ONLY[c.name] ? ("penpot" as const) : ("missing" as const),
      note: PENPOT_ONLY[c.name] ?? VARIANT_NOTES[c.name],
    })),
  }));
  const unknown = [...byComponent.keys()].filter((n) => !known.has(n));
  const all = pages.flatMap((p) => p.rows);
  return {
    pages,
    codeOnly,
    brand: penpotBrand.map((b) => ({ name: b, inCode: brand.has(b) })),
    unknown,
    counts: { penpot: all.length, both: all.filter((r) => r.status === "both").length, penpotOnly: all.filter((r) => r.status === "penpot").length, missing: all.filter((r) => r.status === "missing").length },
  };
}
