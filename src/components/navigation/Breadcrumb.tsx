import { Link } from "react-router-dom";
import { Icon } from "../brand/Icon";
import "./navigation.css";

/** Penpot Breadcrumb. */
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((it, i) => (
          <li key={it.label}>
            {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <Icon name="chevron-right" size={18} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
