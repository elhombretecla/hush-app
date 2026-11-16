// Penpot → token snapshot (manual step).
//
// Run this snippet through the Penpot MCP `execute_code` tool while any HUSH file whose
// token source is "HUSH / Design Foundations" is open. It returns the full token catalog
// (sets, nested token groups with $type/$value and aliases, themes) as a JSON string.
// Save the returned string to src/styles/tokens/source/penpot-tokens.json, then run
// `npm run tokens` to regenerate src/styles/tokens/tokens.css.
//
// This is read-only: it never modifies the Penpot file.
const cat = penpot.library.local.tokens;
const out = {};
for (const s of cat.sets) {
  const root = {};
  for (const t of s.tokens) {
    const parts = t.name.split(".");
    let node = root;
    for (const p of parts.slice(0, -1)) node = node[p] = node[p] || {};
    let v = t.value;
    if (t.type === "typography" && v && typeof v === "object") {
      v = {
        fontFamilies: Array.isArray(v.fontFamily) ? v.fontFamily[0] : v.fontFamily,
        fontSizes: v.fontSize, fontWeights: v.fontWeight, lineHeight: v.lineHeight,
        letterSpacing: v.letterSpacing, textCase: v.textCase, textDecoration: v.textDecoration,
      };
    }
    if (t.type === "shadow" && Array.isArray(v)) v = v.length === 1 ? v[0] : v;
    node[parts[parts.length - 1]] = { $type: t.type, $value: v };
  }
  out[s.name] = root;
}
out.$themes = cat.themes.map((t) => ({
  name: t.name, group: t.group,
  selectedTokenSets: Object.fromEntries(t.activeSets.map((s) => [s.name, "enabled"])),
}));
out.$metadata = {
  tokenSetOrder: cat.sets.map((s) => s.name),
  activeThemes: cat.themes.filter((t) => t.active).map((t) => t.group + "/" + t.name),
  source: "HUSH / Design Foundations (Penpot)",
};
return JSON.stringify(out);
