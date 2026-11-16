import type { CSSProperties, ReactNode } from "react";
import { articleById } from "../data/articles";
import { seedCollections, seedHighlights } from "../data/seed";
import type { ArticleState, ReadingStatus } from "../data/types";

/** Penpot component(s) a story mirrors. The "Penpot sync" page checks these against penpot-components.json. */
export const penpot = (...components: string[]) => ({ penpot: components });

/** Interactive Penpot states (Hover · Pressed · Focus) are forced with storybook-addon-pseudo-states. */
const within = (cls: string) => [`.${cls}`, `.${cls} *`];
export const pseudoStates = { pseudo: { hover: within("is-sb-hover"), active: within("is-sb-pressed"), focusVisible: within("is-sb-focus"), focus: within("is-sb-focus"), focusWithin: within("is-sb-focus") } };
export const stateClass: Record<string, string> = { Hover: "is-sb-hover", Pressed: "is-sb-pressed", Focus: "is-sb-focus" };

export const noop = () => {};

/** Offline stand-in for a captured photo (data: URLs bypass the /api/image proxy). */
export const samplePhoto =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d9bd"/><stop offset="1" stop-color="#f4ead8"/></linearGradient></defs><rect width="1280" height="720" fill="url(#s)"/><circle cx="930" cy="250" r="90" fill="#d9a441"/><path d="M0 470 C 220 360 420 420 640 380 S 1060 300 1280 360 V720 H0z" fill="#6f8f73"/><path d="M0 560 C 260 470 520 540 760 500 S 1120 450 1280 490 V720 H0z" fill="#3f5f4b"/><path d="M0 640 C 300 600 620 650 900 620 S 1180 600 1280 610 V720 H0z" fill="#29473a"/></svg>`,
  );

/** Offline stand-in for a page screenshot (first viewport of an article page, top-aligned). */
export const sampleScreenshot =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 640 400"><rect width="640" height="400" fill="#FFFFFF"/><g fill="#1D1D1B"><rect x="32" y="14" width="140" height="14"/><rect x="538" y="11" width="70" height="20"/><rect x="32" y="104" width="368" height="30"/><rect x="32" y="144" width="262" height="30"/></g><g fill="#B9B5AD"><rect x="400" y="17" width="34" height="8"/><rect x="446" y="17" width="30" height="8"/><rect x="488" y="17" width="34" height="8"/></g><rect y="43" width="640" height="1" fill="#E6E2DA"/><rect x="32" y="82" width="104" height="6" fill="#B5523B"/><g fill="#8C8880"><rect x="32" y="194" width="430" height="10"/><rect x="32" y="213" width="400" height="10"/><rect x="32" y="232" width="300" height="10"/></g><rect x="32" y="266" width="112" height="7" fill="#C4C0B8"/></svg>`,
  );

export const sample = articleById;
export const collections = seedCollections;
export const highlight = seedHighlights.find((h) => h.note) ?? seedHighlights[0];
export const articleState = (status: ReadingStatus, progress = status === "Completed" ? 1 : status === "In progress" ? 0.38 : 0): ArticleState => ({ status, progress, bookmarked: false, inInbox: false, archived: false });

/** A labelled grid of variants, laid out like the Penpot component sheets. */
export function Matrix({ columns, rows, render, minWidth = 0 }: { columns: string[]; rows: string[]; render: (row: string, column: string) => ReactNode; minWidth?: number }) {
  const style: CSSProperties = { display: "grid", gridTemplateColumns: `max-content repeat(${columns.length}, minmax(${minWidth}px, max-content))`, gap: "16px 24px", alignItems: "center" };
  return (
    <div style={style}>
      <span />
      {columns.map((c) => (
        <span key={c} className="overline muted">
          {c}
        </span>
      ))}
      {rows.map((r) => (
        <Row key={r} label={r} columns={columns} render={(c) => render(r, c)} />
      ))}
    </div>
  );
}

function Row({ label, columns, render }: { label: string; columns: string[]; render: (column: string) => ReactNode }) {
  return (
    <>
      <span className="type-label-sm muted-2">{label}</span>
      {columns.map((c) => (
        <div key={c}>{render(c)}</div>
      ))}
    </>
  );
}

/** Vertical list of labelled examples. */
export function Stack({ items, gap = 24, width }: { items: [string, ReactNode][]; gap?: number; width?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, width }}>
      {items.map(([label, node]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="overline muted">{label}</span>
          {node}
        </div>
      ))}
    </div>
  );
}
