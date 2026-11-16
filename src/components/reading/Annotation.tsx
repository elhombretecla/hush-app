import { useEffect, useState } from "react";
import type { Highlight } from "../../data/types";
import { Button } from "../actions/Button";
import { IconButton } from "../actions/IconButton";
import { TextArea } from "../forms/TextInput";
import "./reading.css";

/** Penpot Annotation — quoted excerpt · note · meta · edit/delete. Editable in place. */
interface Props {
  highlight: Highlight;
  startEditing?: boolean;
  onSave: (note: string) => void;
  onDelete: () => void;
  onClose: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function Annotation({ highlight, startEditing, onSave, onDelete, onClose, style, className = "" }: Props) {
  const [editing, setEditing] = useState(!!startEditing || !highlight.note);
  const [draft, setDraft] = useState(highlight.note ?? "");
  useEffect(() => {
    setDraft(highlight.note ?? "");
    setEditing(!!startEditing || !highlight.note);
  }, [highlight.id, highlight.note, startEditing]);
  const when = new Date(highlight.createdAt);
  const ago = Date.now() - when.getTime() < 3600_000 ? "just now" : when.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <aside className={`annotation ${className}`} style={style} aria-label="Highlight note">
      <div className="annotation__quoted">
        <span className={`annotation__rule annotation__rule--${highlight.color ?? "honey"}`} aria-hidden="true" />
        <p className="annotation__excerpt">“{highlight.text.length > 140 ? highlight.text.slice(0, 140) + "…" : highlight.text}”</p>
      </div>
      {editing ? (
        <form
          className="annotation__form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(draft.trim());
            setEditing(false);
          }}
        >
          <label className="visually-hidden" htmlFor={`note-${highlight.id}`}>
            Note
          </label>
          <TextArea id={`note-${highlight.id}`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note to this highlight…" data-autofocus autoFocus />
          <div className="annotation__form-actions">
            <Button intent="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button intent="primary" size="sm" type="submit">
              Save note
            </Button>
          </div>
        </form>
      ) : (
        <p className="type-body-md annotation__note">{highlight.note}</p>
      )}
      <div className="annotation__footer">
        <span className="type-caption muted">You · {ago}</span>
        <div className="annotation__actions">
          {!editing && <IconButton icon="highlight" label="Edit note" onClick={() => setEditing(true)} />}
          <IconButton icon="trash" label="Delete highlight" onClick={onDelete} />
          {!editing && <IconButton icon="close" label="Close" onClick={onClose} />}
        </div>
      </div>
    </aside>
  );
}
