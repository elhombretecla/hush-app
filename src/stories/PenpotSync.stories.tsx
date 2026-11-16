import type { Meta, StoryObj } from "@storybook/react";
import { syncReport, type StoryModule } from "./sync";

const modules = import.meta.glob<StoryModule>("./**/*.stories.tsx", { eager: true });

function Report() {
  const r = syncReport(modules);
  const badge = (status: string) => {
    const map: Record<string, [string, string]> = { both: ["Penpot + code", "var(--color-feedback-success)"], penpot: ["Penpot only", "var(--color-text-tertiary)"], missing: ["Missing in code", "var(--color-feedback-error)"] };
    const [label, color] = map[status];
    return <span className="type-label-sm" style={{ color, whiteSpace: "nowrap" }}>{label}</span>;
  };
  const cell = { padding: "8px 12px", borderBottom: "1px solid var(--color-border-subtle)", verticalAlign: "top" } as const;
  return (
    <div style={{ maxWidth: 1100, color: "var(--color-text-primary)" }}>
      <p className="overline eyebrow">HUSH / UI Kit & Components</p>
      <h1 className="type-display-l" style={{ margin: "4px 0 8px" }}>Penpot sync</h1>
      <p className="type-body-md muted-2" style={{ maxWidth: 720 }}>
        Every component in the Penpot library, matched to the React component and stories that render it. Source: <code>src/stories/penpot-components.json</code> (exported read-only with <code>scripts/penpot-export-components.js</code>). <code>npm test</code> fails if a Penpot component has no story and no reason, or a story names a component Penpot doesn’t have.
      </p>
      <p className="type-heading-4" style={{ margin: "24px 0" }}>
        {r.counts.both} of {r.counts.penpot} in both · {r.counts.penpotOnly} Penpot only · {r.counts.missing} missing · {r.codeOnly.length} code-only stories
      </p>
      {r.pages.map((p) => (
        <section key={p.page} style={{ marginBottom: 32 }}>
          <h2 className="type-heading-3" style={{ margin: "0 0 8px" }}>{p.page}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }} className="type-body-sm">
            <thead>
              <tr className="overline muted" style={{ textAlign: "left" }}>
                <th style={cell}>Penpot component</th>
                <th style={cell}>Variants</th>
                <th style={cell}>Status</th>
                <th style={cell}>Stories / notes</th>
              </tr>
            </thead>
            <tbody>
              {p.rows
                .filter((row) => !row.name.startsWith("Icon / "))
                .map((row) => (
                  <tr key={row.name}>
                    <td style={cell}><strong>{row.name}</strong></td>
                    <td style={cell} className="muted-2">{row.variants ? Object.entries(row.variants).map(([k, v]) => `${k}: ${v.join(" · ")}`).join(" — ") : "—"}</td>
                    <td style={cell}>{badge(row.status)}</td>
                    <td style={cell}>
                      {row.stories.map((s) => (
                        <a key={s.id} href={`./?path=/story/${s.id}`} target="_top" style={{ display: "block", color: "var(--color-text-accent)" }}>
                          {s.title.split("/").pop()} › {s.story}
                        </a>
                      ))}
                      {row.note && <span className="muted">{row.note}</span>}
                    </td>
                  </tr>
                ))}
              {p.rows.some((row) => row.name.startsWith("Icon / ")) && (
                <tr>
                  <td style={cell}><strong>Icon / *</strong></td>
                  <td style={cell} className="muted-2">{p.rows.filter((row) => row.name.startsWith("Icon / ")).length} icons</td>
                  <td style={cell}>{badge(p.rows.filter((row) => row.name.startsWith("Icon / ")).every((row) => row.status === "both") ? "both" : "missing")}</td>
                  <td style={cell}>
                    <a href="./?path=/story/01-·-buttons-actions-icon--all-icons" target="_top" style={{ color: "var(--color-text-accent)" }}>Icon › All icons</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      ))}
      <section style={{ marginBottom: 32 }}>
        <h2 className="type-heading-3">Brand (HUSH / Design Foundations)</h2>
        <p className="type-body-sm muted-2">{r.brand.map((b) => `${b.name} ${b.inCode ? "✓" : "✗"}`).join(" · ")}</p>
      </section>
      <section>
        <h2 className="type-heading-3">Code only</h2>
        <ul className="type-body-sm">
          {r.codeOnly.map((c) => (
            <li key={c.id}>
              <a href={`./?path=/story/${c.id}`} target="_top" style={{ color: "var(--color-text-accent)" }}>{c.story}</a> — {c.note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta: Meta = { title: "Penpot sync", parameters: { layout: "padded" } };
export default meta;
export const Overview: StoryObj = { render: () => <Report /> };
