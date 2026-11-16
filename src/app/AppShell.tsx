import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DesktopSidebar } from "../components/navigation/DesktopSidebar";
import { MobileBottomNavigation } from "../components/navigation/MobileBottomNavigation";
import { SaveContentDialog } from "../features/save/SaveContentDialog";
import { SaveDialogContext } from "./SaveDialogContext";
import "./shell.css";

/** Penpot DesktopAppShell (sidebar + content) / MobileAppShell (top bar + content + bottom navigation). */
export function AppShell() {
  const [saveOpen, setSaveOpen] = useState(false);
  const open = useCallback(() => setSaveOpen(true), []);
  const { pathname } = useLocation();
  return (
    <SaveDialogContext.Provider value={open}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="app-shell">
        <div className="only-desktop">
          <DesktopSidebar onSave={open} />
        </div>
        <div className="app-shell__main">
          <Outlet />
        </div>
      </div>
      <div className="only-mobile">
        <MobileBottomNavigation />
        {pathname === "/" && (
          <button type="button" className="save-fab" aria-label="Save something" onClick={open}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
      <SaveContentDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
    </SaveDialogContext.Provider>
  );
}
