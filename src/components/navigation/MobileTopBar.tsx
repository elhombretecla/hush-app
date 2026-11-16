import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "../actions/IconButton";
import { Wordmark } from "../brand/Wordmark";
import "./navigation.css";

/** Penpot MobileTopBar — Type: Brand · Title · Reader. */
interface MobileTopBarProps {
  type: "brand" | "title" | "reader";
  title?: string;
  back?: string;
  actions?: ReactNode;
}

export function MobileTopBar({ type, title, back, actions }: MobileTopBarProps) {
  const navigate = useNavigate();
  if (type === "brand") {
    return (
      <div className="mobile-top-bar mobile-top-bar--brand">
        <Link to="/" aria-label="hush. home">
          <Wordmark size={30} />
        </Link>
        <div className="mobile-top-bar__actions">
          <IconButton icon="search" label="Search" onClick={() => navigate("/search")} />
          <IconButton icon="user" label="Preferences" onClick={() => navigate("/preferences")} />
        </div>
      </div>
    );
  }
  return (
    <div className={`mobile-top-bar mobile-top-bar--${type}`}>
      <IconButton icon="chevron-left" label="Back" onClick={() => (back ? navigate(back) : navigate(-1))} />
      <span className={type === "reader" ? "type-caption mobile-top-bar__title mobile-top-bar__title--reader" : "type-label-md mobile-top-bar__title"}>{title}</span>
      <div className="mobile-top-bar__actions">{actions ?? <span className="mobile-top-bar__spacer" />}</div>
    </div>
  );
}
