#!/usr/bin/env node
// Penpot token snapshot → CSS custom properties.
//
//   src/styles/tokens/source/penpot-tokens.json  (exported from "HUSH / Design Foundations")
//     → src/styles/tokens/tokens.css
//
// Naming:  color.action.primary → --color-action-primary
// Aliases: "{palette.moss.800}"  → var(--palette-moss-800)   (never flattened)
//
// Set placement follows the Penpot themes in the snapshot:
//   - sets shared by every "Appearance" theme  → :root
//   - sets unique to one Appearance theme      → :root[data-theme="<name>"]
//   - "Density" theme sets                     → :root[data-density="<name>"]
// The first theme of each group is also the default on :root.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(root, "src/styles/tokens/source/penpot-tokens.json");
const OUTPUT = resolve(root, "src/styles/tokens/tokens.css");

const FONT_FALLBACKS = {
  Fraunces: ['"Fraunces Variable"', "Georgia", "serif"],
  Inter: ['"Inter Variable"', "system-ui", "sans-serif"],
  Literata: ['"Literata Variable"', "Georgia", "serif"],
};
const PX_TYPES = new Set(["spacing", "sizing", "dimension", "borderRadius", "borderWidth", "fontSizes", "letterSpacing"]);

const source = JSON.parse(readFileSync(SOURCE, "utf8"));
const themes = source.$themes ?? [];
const setOrder = source.$metadata?.tokenSetOrder ?? Object.keys(source).filter((k) => !k.startsWith("$"));

const cssName = (tokenName) => "--" + tokenName.replace(/\./g, "-");
const isRef = (v) => typeof v === "string" && /^\{[^}]+\}$/.test(v.trim());
const refVar = (v) => `var(${cssName(v.trim().slice(1, -1))})`;

/** Flatten a nested token group into [name, token] pairs. */
function flatten(node, prefix = [], out = []) {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object" && "$value" in value) out.push([[...prefix, key].join("."), value]);
    else if (value && typeof value === "object") flatten(value, [...prefix, key], out);
  }
  return out;
}

function scalar(type, value) {
  if (isRef(value)) return refVar(value);
  switch (type) {
    case "fontFamilies": {
      const fams = Array.isArray(value) ? value : String(value).split(",").map((s) => s.trim());
      return fams.flatMap((f) => [`"${f}"`, ...(FONT_FALLBACKS[f] ?? [])]).join(", ");
    }
    case "textCase":
      return value === "none" ? "none" : value;
    default:
      return PX_TYPES.has(type) && /^-?\d*\.?\d+$/.test(String(value)) ? (Number(value) === 0 ? "0" : `${value}px`) : String(value);
  }
}

/** Returns [cssVarName, cssValue][] for one token (composites expand to several properties). */
function declarations(name, token) {
  const { $type: type, $value: value } = token;
  if (type === "typography") {
    const v = value ?? {};
    const part = (key, t) => (v[key] == null ? null : scalar(t, v[key]));
    const base = cssName(name);
    return [
      [`${base}-font-family`, part("fontFamilies", "fontFamilies")],
      [`${base}-font-size`, part("fontSizes", "fontSizes")],
      [`${base}-font-weight`, part("fontWeights", "fontWeights")],
      [`${base}-line-height`, part("lineHeight", "number")],
      [`${base}-letter-spacing`, part("letterSpacing", "letterSpacing")],
      [`${base}-text-transform`, part("textCase", "textCase")],
    ].filter(([, val]) => val != null);
  }
  if (type === "shadow") {
    const layers = (Array.isArray(value) ? value : [value]).map((s) =>
      [s.inset === true || s.inset === "true" ? "inset" : "", `${s.offsetX}px`, `${s.offsetY}px`, `${s.blur}px`, `${s.spread}px`, isRef(s.color) ? refVar(s.color) : s.color]
        .filter(Boolean)
        .join(" "),
    );
    return [[cssName(name), layers.join(", ")]];
  }
  return [[cssName(name), scalar(type, value)]];
}

const block = (selector, setNames, comment) => {
  const lines = [];
  for (const set of setNames) {
    if (!source[set]) continue;
    lines.push(`  /* ${set} */`);
    for (const [name, token] of flatten(source[set])) for (const [prop, val] of declarations(name, token)) lines.push(`  ${prop}: ${val};`);
  }
  return `/* ${comment} */\n${selector} {\n${lines.join("\n")}\n}\n`;
};

// Group themes and derive which sets are shared vs. theme-specific.
const groups = {};
for (const t of themes) (groups[t.group] ??= []).push({ name: t.name, sets: Object.keys(t.selectedTokenSets).filter((s) => t.selectedTokenSets[s] === "enabled") });
const sortSets = (sets) => [...sets].sort((a, b) => setOrder.indexOf(a) - setOrder.indexOf(b));

const appearance = groups.Appearance ?? [];
const shared = sortSets(appearance.length ? appearance[0].sets.filter((s) => appearance.every((t) => t.sets.includes(s))) : setOrder);
const sharedNoComponents = shared.filter((s) => s !== "components");
const hasComponents = shared.includes("components");

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const parts = [
  `/* GENERATED by scripts/build-tokens.mjs from ${source.$metadata?.source ?? "Penpot"} — do not edit by hand. Run \`npm run tokens\`. */\n`,
  block(":root", sharedNoComponents, "Shared sets: " + sharedNoComponents.join(", ")),
];
appearance.forEach((t, i) => {
  const own = sortSets(t.sets.filter((s) => !shared.includes(s)));
  const selector = (i === 0 ? ":root, " : "") + `:root[data-theme="${slug(t.name)}"]`;
  parts.push(block(selector, own, `Appearance / ${t.name}`));
});
if (hasComponents) parts.push(block(":root", ["components"], "Component tokens (alias semantic tokens, so they follow the active theme)"));
for (const [group, list] of Object.entries(groups)) {
  if (group === "Appearance") continue;
  list.forEach((t, i) => {
    const selector = (i === 0 ? ":root, " : "") + `:root[data-${slug(group)}="${slug(t.name)}"]`;
    parts.push(block(selector, sortSets(t.sets), `${group} / ${t.name}`));
  });
}

// Typography utility classes, one per Penpot typography token.
const typo = [];
for (const set of setOrder) for (const [name, token] of flatten(source[set] ?? {})) {
  if (token.$type !== "typography") continue;
  const base = cssName(name);
  typo.push(
    `.${name.replace(/\./g, "-")} {\n  font-family: var(${base}-font-family);\n  font-size: var(${base}-font-size);\n  font-weight: var(${base}-font-weight);\n  line-height: var(${base}-line-height);\n  letter-spacing: var(${base}-letter-spacing);\n  text-transform: var(${base}-text-transform);\n}`,
  );
}
parts.push(`/* Typography tokens as classes */\n${typo.join("\n")}\n`);

writeFileSync(OUTPUT, parts.join("\n"));
const count = setOrder.reduce((n, s) => n + flatten(source[s] ?? {}).length, 0);
console.log(`tokens.css written — ${count} tokens from ${setOrder.length} sets, ${themes.length} themes.`);
