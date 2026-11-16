import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const css = () => readFileSync(resolve(root, "src/styles/tokens/tokens.css"), "utf8");

describe("Penpot token transformation", () => {
  beforeAll(() => execFileSync("node", [resolve(root, "scripts/build-tokens.mjs")]));

  it("keeps semantic tokens as aliases of primitives", () => {
    expect(css()).toContain("--palette-moss-800: #294B3D;");
    expect(css()).toContain("--color-action-primary: var(--palette-moss-800);");
  });

  it("emits one selector per Appearance theme with different values", () => {
    const out = css();
    expect(out).toMatch(/:root, :root\[data-theme="paper"\] \{[^}]*--color-bg-canvas: var\(--palette-paper-50\);/);
    expect(out).toMatch(/:root\[data-theme="night"\] \{[^}]*--color-bg-canvas: var\(--palette-night-900\);/);
    expect(out).toMatch(/:root\[data-theme="sepia"\] \{[^}]*--color-bg-canvas: var\(--palette-sepia-100\);/);
  });

  it("expands composite tokens and adds px units", () => {
    const out = css();
    expect(out).toContain("--type-reader-body-font-size: var(--font-size-reader);");
    expect(out).toContain("--font-size-reader: 20px;");
    expect(out).toContain("--space-24: 24px;");
    expect(out).toContain("--button-primary-bg: var(--color-action-primary);");
    expect(out).toMatch(/:root\[data-density="compact"\] \{[^}]*--density-list-gap: 8px;/);
  });

  it("does not drop any token from the snapshot", () => {
    const source = JSON.parse(readFileSync(resolve(root, "src/styles/tokens/source/penpot-tokens.json"), "utf8"));
    const names: string[] = [];
    const walk = (n: Record<string, unknown>, p: string[]) =>
      Object.entries(n).forEach(([k, v]) => (v && typeof v === "object" && "$value" in v ? names.push([...p, k].join("-")) : v && typeof v === "object" && walk(v as Record<string, unknown>, [...p, k])));
    for (const set of source.$metadata.tokenSetOrder) walk(source[set], []);
    const out = css();
    const missing = names.filter((n) => !out.includes(`--${n}:`) && !out.includes(`--${n}-font-family:`));
    expect(missing).toEqual([]);
  });
});
