import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "../brand/Icon";
import "./navigation.css";

/** Penpot SidebarNavItem — State: Default · Hover · Active (from the route). */
export function SidebarNavItem({ to, icon, label, count, end }: { to: string; icon: IconName; label: string; count?: number; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `sidebar-nav-item ${isActive ? "is-active" : ""}`}>
      <Icon name={icon} />
      <span className="sidebar-nav-item__label">{label}</span>
      {count != null && <span className="sidebar-nav-item__count">{count}</span>}
    </NavLink>
  );
}
