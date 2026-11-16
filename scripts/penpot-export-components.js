// Read-only snapshot of the HUSH / UI Kit & Components library.
// Run it through the Penpot MCP `execute_code` tool with the UI Kit file open, then save the returned
// JSON as src/stories/penpot-components.json. `npm run storybook` shows it against the code catalogue.
// The plugin can't see the instance URL or the team: keep "baseUrl" and "teamId" from the current JSON
// (both appear in any "Copy link" URL) when replacing the file.
const groups = {};
const pageIds = {};
for (const p of penpotUtils.getPages()) {
  const page = penpotUtils.getPageById(p.id);
  if (!page) continue;
  pageIds[p.name] = p.id;
  const mains = penpotUtils.findShapes((s) => s.isComponentMainInstance && s.isComponentMainInstance(), page.root);
  for (const m of mains) {
    const c = m.component();
    if (!c) continue;
    const variant = c.isVariant && c.isVariant();
    const name = variant ? c.name : (c.path ? c.path + " / " : "") + c.name;
    const list = (groups[p.name] ??= {});
    if (list[name]) continue;
    // Variant sets link to their container board; single components to their main instance.
    const board = variant && m.parent && m.parent.type === "board" ? m.parent : m;
    const entry = { name, boardId: board.id };
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
  .map((page) => ({ page, pageId: pageIds[page], components: Object.values(groups[page]).sort((a, b) => a.name.localeCompare(b.name)) }));
const foundations = penpot.library.connected.find((l) => l.name === "HUSH / Design Foundations");
return {
  file: penpot.currentFile.name,
  baseUrl: "",
  teamId: "",
  fileId: penpot.currentFile.id,
  pages,
  brand: foundations ? foundations.components.map((c) => `${c.path} / ${c.name}`).sort() : [],
};
