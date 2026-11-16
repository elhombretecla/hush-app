# hush.

**Make room for what matters.** HUSH is a calm personal reading app: save articles, newsletters, videos and podcasts, read them without distractions, keep highlights and notes, and organise them into collections.

The interface is implemented from the four HUSH Penpot files (Design Foundations, UI Kit & Components, Desktop Experience, Mobile Experience). Component names and variant props mirror the Penpot UI Kit; every colour, size and type style comes from the Penpot design tokens.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build and test

```bash
npm run build      # regenerates tokens, type-checks, builds to dist/
npm test           # unit and interaction tests (Vitest)
```

## Refreshing the Penpot token snapshot

Tokens flow one way: **Penpot Foundations → JSON snapshot → `npm run tokens` → CSS custom properties**.

1. Open any HUSH Penpot file whose token source is *HUSH / Design Foundations* and run `scripts/penpot-export-tokens.js` through the Penpot MCP `execute_code` tool (read-only).
2. Save the returned JSON as `src/styles/tokens/source/penpot-tokens.json`.
3. Run `npm run tokens` to regenerate `src/styles/tokens/tokens.css`.

Naming is deterministic (`color.action.primary` → `--color-action-primary`), aliases stay as `var()` references, and the Penpot themes become `data-theme="paper|night|sepia"` and `data-density="comfortable|compact"` on `<html>`. Step 1 is a manual export; there is no live sync.
