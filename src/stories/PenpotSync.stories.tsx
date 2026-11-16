import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { SegmentedControl } from "../components/actions/SegmentedControl";
import { Icon } from "../components/brand/Icon";
import { SearchInput } from "../components/forms/SearchInput";
import { CODE_VARIANTS, MISSING_VARIANTS, penpotFile, syncReport, type StoryModule, type StoryRef } from "./sync";
import "./penpot-sync.css";

const modules = import.meta.glob<StoryModule>("./**/*.stories.tsx", { eager: true });

type Status = "both" | "penpot" | "missing";
type Row = { name: string; variants?: Record<string, string[]>; url?: string; stories: StoryRef[]; status: Status; note?: string; count?: number };
const FILTERS = ["All", "In both", "Penpot only", "With notes"] as const;
const STATUS_LABEL: Record<Status | "code", string> = { both: "Penpot + code", penpot: "Penpot only", missing: "Missing in code", code: "Code only" };

const storyHref = (id: string) => `./?path=/story/${id}`;
/** "Button · Intent × State" → "Intent × State": the component is already in the first column. */
const storyLabel = (s: StoryRef, component: string) => s.story.replace(new RegExp(`^${component.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*[·›]\\s*`), "");

function StatusPill({ status }: { status: Status | "code" }) {
  return <span className={`sync-status sync-status--${status}`}>{STATUS_LABEL[status]}</span>;
}

function PenpotLink({ url, label = "Open in Penpot" }: { url?: string; label?: string }) {
  if (!url) return null;
  return (
    <a className="sync-penpot-link" href={url} target="_blank" rel="noopener noreferrer">
      {label}
      <Icon name="external" size={14} />
    </a>
  );
}

function Variants({ row }: { row: Row }) {
  if (row.count) return <span className="sync-none">{row.count} icons, 24 × 24</span>;
  const extra = CODE_VARIANTS[row.name] ?? {};
  const missing = MISSING_VARIANTS[row.name] ?? {};
  const props = Array.from(new Set([...Object.keys(row.variants ?? {}), ...Object.keys(extra)]));
  if (!props.length) return <span className="sync-none">Single component</span>;
  return (
    <div className="sync-props">
      {props.map((prop) => (
        <div className="sync-prop" key={prop}>
          <span className="sync-prop__name">{prop}</span>
          <span className="sync-chips">
            {(row.variants?.[prop] ?? []).map((v) => (
              <span key={v} className="sync-chip" title={missing[prop]?.includes(v) ? "Not implemented in code" : undefined} style={missing[prop]?.includes(v) ? { textDecoration: "line-through" } : undefined}>
                {v}
              </span>
            ))}
            {(extra[prop] ?? []).map((v) => (
              <span key={v} className="sync-chip sync-chip--extra" title="Only in code">
                + {v}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function SyncTable({ rows }: { rows: Row[] }) {
  return (
    <table className="sync-table">
      <colgroup>
        <col className="c-name" />
        <col className="c-variants" />
        <col className="c-status" />
        <col className="c-stories" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Component</th>
          <th scope="col">Variants</th>
          <th scope="col">Status</th>
          <th scope="col">Storybook</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>
              <div className="sync-name">
                <strong>{row.name}</strong>
                <PenpotLink url={row.url} />
              </div>
            </td>
            <td data-label="Variants">
              <Variants row={row} />
            </td>
            <td data-label="Status">
              <StatusPill status={row.status} />
            </td>
            <td data-label="Storybook">
              {row.stories.length > 0 && (
                <ul className="sync-stories">
                  {row.stories.map((s) => (
                    <li key={s.id}>
                      <a href={storyHref(s.id)} target="_top">
                        {row.count ? s.story : storyLabel(s, row.name)}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {row.note && <span className={`sync-note ${row.status !== "both" ? "" : "sync-note--warn"}`}>{row.note}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Report() {
  const r = useMemo(() => syncReport(modules), []);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return r.pages
      .map((p) => {
        const icons = p.rows.filter((row) => row.name.startsWith("Icon / "));
        const rows: Row[] = p.rows.filter((row) => !row.name.startsWith("Icon / "));
        if (icons.length)
          rows.push({
            name: "Icon / *",
            count: icons.length,
            url: p.url,
            stories: icons[0].stories.slice(0, 2),
            status: icons.every((i) => i.status === "both") ? "both" : "missing",
          });
        const shown = rows
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((row) => !q || row.name.toLowerCase().includes(q) || Object.values(row.variants ?? {}).flat().some((v) => v.toLowerCase().includes(q)))
          .filter((row) => (filter === "In both" ? row.status === "both" : filter === "Penpot only" ? row.status !== "both" : filter === "With notes" ? !!row.note || !!CODE_VARIANTS[row.name] || !!MISSING_VARIANTS[row.name] : true));
        return { page: p.page, url: p.url, total: rows.length, inCode: rows.filter((row) => row.status === "both").length, rows: shown };
      })
      .filter((s) => s.rows.length);
  }, [r, query, filter]);

  const shownCount = sections.reduce((n, s) => n + s.rows.length, 0);
  const pct = (n: number) => `${(n / r.counts.penpot) * 100}%`;

  return (
    <div className="sync">
      <header className="sync__head">
        <p className="overline eyebrow">{penpotFile}</p>
        <h1 className="type-display-l sync__title">Penpot sync</h1>
        <p className="type-body-md sync__intro">
          Every component in the Penpot library, next to the stories that render its React counterpart. The list comes from <code>src/stories/penpot-components.json</code>, a read-only export made with <code>scripts/penpot-export-components.js</code>; <code>npm test</code> fails when a Penpot component has no story and no documented reason.
        </p>
      </header>

      <section className="sync-stats" aria-label="Summary">
        <div className="sync-stat sync-stat--both">
          <span className="sync-stat__value">{r.counts.both}</span>
          <span className="sync-stat__label">In Penpot and code</span>
          <span className="sync-stat__hint">of {r.counts.penpot} Penpot components (42 are icons)</span>
        </div>
        <div className="sync-stat">
          <span className="sync-stat__value">{r.counts.penpotOnly}</span>
          <span className="sync-stat__label">Penpot only</span>
          <span className="sync-stat__hint">not used by the app, with the reason</span>
        </div>
        <div className="sync-stat sync-stat--missing">
          <span className="sync-stat__value">{r.counts.missing}</span>
          <span className="sync-stat__label">Missing in code</span>
          <span className="sync-stat__hint">would fail the sync test</span>
        </div>
        <div className="sync-stat">
          <span className="sync-stat__value">{r.codeOnly.length}</span>
          <span className="sync-stat__label">Code only</span>
          <span className="sync-stat__hint">helpers on top of Penpot components</span>
        </div>
      </section>
      <div className="sync-coverage" aria-hidden="true">
        <div className="sync-coverage__bar">
          <span className="sync-coverage__both" style={{ width: pct(r.counts.both) }} />
          <span className="sync-coverage__penpot" style={{ width: pct(r.counts.penpotOnly) }} />
          <span className="sync-coverage__missing" style={{ width: pct(r.counts.missing) }} />
        </div>
        <span className="type-label-sm">{Math.round((r.counts.both / r.counts.penpot) * 100)}% covered</span>
      </div>

      <div className="sync-toolbar">
        <SearchInput value={query} onChange={setQuery} label="Filter components" placeholder="Filter by component or variant" />
        <SegmentedControl label="Show" options={FILTERS} value={filter} onChange={setFilter} />
        <span className="type-caption sync-toolbar__count">{shownCount} shown</span>
      </div>

      {sections.length === 0 && <p className="sync-empty">No components match “{query}”.</p>}
      {sections.map((s) => (
        <section className="sync-section" key={s.page}>
          <div className="sync-section__head">
            <h2 className="type-heading-3 sync-section__title">{s.page}</h2>
            <span className="type-caption sync-section__count">
              {s.inCode} of {s.total} in code
            </span>
            <span className="sync-section__link">
              <PenpotLink url={s.url} label="Open page in Penpot" />
            </span>
          </div>
          <SyncTable rows={s.rows} />
        </section>
      ))}

      {filter === "All" && !query && (
        <>
          <section className="sync-section">
            <div className="sync-section__head">
              <h2 className="type-heading-3 sync-section__title">Brand · Design Foundations</h2>
              <span className="type-caption sync-section__count">
                {r.brand.filter((b) => b.inCode).length} of {r.brand.length} in code
              </span>
            </div>
            <SyncTable rows={r.brand.map((b) => ({ name: b.name, stories: b.inCode ? [{ id: "brand-wordmark--all-marks", title: "Brand/Wordmark", story: "All marks" }] : [], status: b.inCode ? "both" : "missing" }))} />
          </section>
          <section className="sync-section">
            <div className="sync-section__head">
              <h2 className="type-heading-3 sync-section__title">Code only</h2>
              <span className="type-caption sync-section__count">Not in Penpot — conveniences built on Penpot components</span>
            </div>
            <table className="sync-table">
              <colgroup>
                <col className="c-name" />
                <col className="c-variants" />
                <col className="c-status" />
                <col className="c-stories" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">What it is</th>
                  <th scope="col">Status</th>
                  <th scope="col">Storybook</th>
                </tr>
              </thead>
              <tbody>
                {r.codeOnly.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.note.split(" — ")[0]}</strong>
                    </td>
                    <td data-label="What it is">{c.note.split(" — ")[1]}</td>
                    <td data-label="Status">
                      <StatusPill status="code" />
                    </td>
                    <td data-label="Storybook">
                      <ul className="sync-stories">
                        <li>
                          <a href={storyHref(c.id)} target="_top">
                            {c.title.split("/").pop()} · {c.story.replace(/ \(code\)$/, "")}
                          </a>
                        </li>
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
      <p className="sync-foot">Penpot links open the board in the workspace (same as “Copy link” on a board). Requires access to the HUSH team.</p>
    </div>
  );
}

const meta: Meta = { title: "Penpot sync", parameters: { layout: "fullscreen" } };
export default meta;
export const Overview: StoryObj = { render: () => <Report /> };
