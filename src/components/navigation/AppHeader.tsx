import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/store";
import type { Theme } from "../../data/types";
import { Button } from "../actions/Button";
import { IconButton } from "../actions/IconButton";
import { Icon } from "../brand/Icon";
import "./navigation.css";

const NEXT_THEME: Record<Theme, Theme> = { paper: "night", night: "sepia", sepia: "paper" };

/** Penpot AppHeader — eyebrow · title · search trigger · theme · Save. */
export function AppHeader({ title, eyebrow, onSave }: { title: string; eyebrow?: string; onSave: () => void }) {
  const navigate = useNavigate();
  const { state, setPrefs } = useStore();
  const next = NEXT_THEME[state.prefs.theme];
  return (
    <header className="app-header">
      <div className="app-header__titles">
        {eyebrow && <span className="type-caption muted">{eyebrow}</span>}
        <span className="type-heading-4 app-header__title" aria-hidden="true">
          {title}
        </span>
      </div>
      <div className="app-header__actions">
        <button type="button" className="field app-header__search" onClick={() => navigate("/search")}>
          <Icon name="search" />
          <span className="type-body-sm">Search your library</span>
          <kbd className="field__kbd">⌘K</kbd>
        </button>
        <IconButton icon={state.prefs.theme === "night" ? "moon" : "sun"} label={`Switch to ${next} appearance`} onClick={() => setPrefs({ theme: next })} />
        <Button intent="primary" icon="plus" onClick={onSave}>
          Save
        </Button>
      </div>
    </header>
  );
}
