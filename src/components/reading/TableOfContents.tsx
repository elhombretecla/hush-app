import "./reading.css";

/** Penpot TableOfContents — active section marked with a moss rule. */
export function TableOfContents({ items, active, onSelect }: { items: { id: string; label: string }[]; active: string | null; onSelect: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <nav className="toc" aria-label="In this essay">
      <span className="overline muted toc__label">In this essay</span>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" className={`toc__item ${active === it.id ? "is-active" : ""}`} aria-current={active === it.id ? "location" : undefined} onClick={() => onSelect(it.id)}>
              {it.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
