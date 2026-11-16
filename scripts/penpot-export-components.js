// Read-only snapshot of the HUSH / UI Kit & Components library.
// Run it through the Penpot MCP `execute_code` tool with the UI Kit file open, then save the returned
// JSON as src/stories/penpot-components.json. `npm run storybook` shows it against the code catalogue.
const groups = {};
for (const p of penpotUtils.getPages()) {
  const page = penpotUtils.getPageById(p.id);
  if (!page) continue;
  const mains = penpotUtils.findShapes((s) => s.isComponentMainInstance && s.isComponentMainInstance(), page.root);
  for (const m of mains) {
    const c = m.component();
    if (!c) continue;
    const variant = c.isVariant && c.isVariant();
    const name = variant ? c.name : (c.path ? c.path + " / " : "") + c.name;
    const list = (groups[p.name] ??= {});
    if (list[name]) continue;
    const entry = { name };
    if (variant) {
      const props = c.variants.properties;
      const values = {};
      for (const v of c.variants.variantComponents()) for (const prop of props) (values[prop] ??= []).includes(v.variantProps[prop]) || values[prop].push(v.variantProps[prop]);
      entry.variants = values;
    }
    list[name] = entry;
  }
}
const pages = Object.keys(groups)
  .sort()
  .map((page) => ({ page, components: Object.values(groups[page]).sort((a, b) => a.name.localeCompare(b.name)) }));
const foundations = penpot.library.connected.find((l) => l.name === "HUSH / Design Foundations");
return {
  file: penpot.currentFile.name,
  pages,
  brand: foundations ? foundations.components.map((c) => `${c.path} / ${c.name}`).sort() : [],
};
