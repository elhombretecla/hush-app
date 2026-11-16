import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "../brand/Icon";
import "./navigation.css";

/** Penpot MobileBottomNavigation — five MobileTabItem instances (Active · Inactive). */
const TABS: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: "/", icon: "home", label: "Home", end: true },
  { to: "/inbox", icon: "inbox", label: "Inbox" },
  { to: "/library", icon: "library", label: "Library" },
  { to: "/highlights", icon: "highlight", label: "Highlights" },
  { to: "/focus", icon: "focus", label: "Focus" },
];

export function MobileBottomNavigation() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `mobile-tab ${isActive ? "is-active" : ""}`}>
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
