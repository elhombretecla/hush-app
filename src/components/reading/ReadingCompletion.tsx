import type { ReactNode } from "react";
import { Icon } from "../brand/Icon";
import "./reading.css";

/** Penpot ReadingCompletion — a quiet moment of closure; no streaks, no confetti. */
export function ReadingCompletion({ minutes, highlights, notes, collectionName, next, actions }: { minutes: number; highlights: number; notes: number; collectionName?: string; next?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="reading-completion">
      <span className="reading-completion__mark" aria-hidden="true">
        <Icon name="check" />
      </span>
      <div className="reading-completion__text">
        <h2 className="type-heading-2">You took the long way.</h2>
        <p className="type-body-lg muted-2">
          {minutes} minutes, {highlights} {highlights === 1 ? "highlight" : "highlights"} and {notes} {notes === 1 ? "note" : "notes"}
          {collectionName ? ` — saved to ${collectionName}.` : "."}
        </p>
      </div>
      <dl className="reading-completion__stats">
        <div>
          <dt className="type-caption muted">reading time</dt>
          <dd className="type-heading-3">{minutes} min</dd>
        </div>
        <div>
          <dt className="type-caption muted">highlights</dt>
          <dd className="type-heading-3">{highlights}</dd>
        </div>
        <div>
          <dt className="type-caption muted">notes</dt>
          <dd className="type-heading-3">{notes}</dd>
        </div>
      </dl>
      {next && (
        <div className="reading-completion__next">
          <span className="overline muted">Read next</span>
          {next}
        </div>
      )}
      {actions && <div className="reading-completion__actions">{actions}</div>}
    </div>
  );
}
