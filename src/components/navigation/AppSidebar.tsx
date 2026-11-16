import { Link, NavLink } from "react-router-dom";
import { useStore } from "../../app/store";
import { userProfile } from "../../data/seed";
import { Button } from "../actions/Button";
import { Icon } from "../brand/Icon";
import { Wordmark } from "../brand/Wordmark";
import { SidebarNavItem } from "./SidebarNavItem";
import "./navigation.css";

/** Penpot DesktopSidebar (248px). */
export function AppSidebar({ onSave }: { onSave: () => void }) {
  const { state, allArticles } = useStore();
  const inboxCount = allArticles.filter((a) => state.articleState[a.id]?.inInbox).length;
  const libraryCount = allArticles.filter((a) => !state.articleState[a.id]?.archived).length;
  const themeName = state.prefs.theme[0].toUpperCase() + state.prefs.theme.slice(1);
  return (
    <aside className="app-sidebar" aria-label="Primary">
      <Link to="/" className="app-sidebar__brand" aria-label="hush. home">
        <Wordmark size={40} />
      </Link>
      <nav className="app-sidebar__nav">
        <SidebarNavItem to="/" end icon="home" label="Home" />
        <SidebarNavItem to="/inbox" icon="inbox" label="Inbox" count={inboxCount} />
        <SidebarNavItem to="/library" icon="library" label="My Library" count={libraryCount} />
        <SidebarNavItem to="/collections" icon="collection" label="Collections" />
        <SidebarNavItem to="/highlights" icon="highlight" label="Highlights & Notes" />
        <SidebarNavItem to="/focus" icon="focus" label="Focus Sessions" />
        <SidebarNavItem to="/search" icon="search" label="Search" />
      </nav>
      <div className="app-sidebar__collections">
        <span className="overline muted app-sidebar__group-label">Collections</span>
        {state.collections.map((c) => (
          <NavLink key={c.id} to={`/collections/${c.id}`} className={({ isActive }) => `app-sidebar__collection ${isActive ? "is-active" : ""}`}>
            <span className={`dot dot--${c.accent}`} aria-hidden="true" />
            {c.name}
          </NavLink>
        ))}
      </div>
      <div className="app-sidebar__spacer" />
      <Button intent="primary" icon="plus" fullWidth onClick={onSave}>
        Save something
      </Button>
      <Link to="/preferences" className="app-sidebar__profile">
        <span className="avatar" aria-hidden="true">
          {userProfile.initials}
        </span>
        <span className="app-sidebar__profile-text">
          <span className="type-label-sm">{userProfile.name}</span>
          <span className="type-caption muted">
            {themeName} · {state.prefs.density === "compact" ? "Compact" : "Comfortable"}
          </span>
        </span>
        <Icon name="settings" label="Preferences" />
      </Link>
    </aside>
  );
}
