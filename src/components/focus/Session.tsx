import type { ReactNode } from "react";
import type { Article } from "../../data/types";
import { Button } from "../actions/Button";
import { Icon } from "../brand/Icon";
import { AppIcon } from "../brand/Wordmark";
import { Checkbox } from "../forms/Checkbox";
import "../reading/reading.css";
import "./focus.css";

/** Penpot DurationOption — Minutes: 10 · 20 · 30 × Selected. */
export function DurationOption({ minutes, hint, selected, onSelect }: { minutes: number; hint: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={`duration-option ${selected ? "is-selected" : ""}`} onClick={onSelect}>
      <span className="duration-option__top">
        <Icon name="clock" />
        {selected && <Icon name="check" />}
      </span>
      <span className="duration-option__value">
        <span className="duration-option__minutes">{minutes}</span>
        <span className="duration-option__unit">min</span>
      </span>
      <span className="duration-option__hint">{hint}</span>
    </button>
  );
}

/** Penpot SessionDurationSelector — three DurationOption cards. */
export function SessionDurationSelector({ options, value, onChange }: { options: readonly { minutes: number; hint: string }[]; value: number; onChange: (minutes: number) => void }) {
  return (
    <div className="duration-options" role="radiogroup" aria-label="Session length">
      {options.map((d) => (
        <DurationOption key={d.minutes} minutes={d.minutes} hint={d.hint} selected={d.minutes === value} onSelect={() => onChange(d.minutes)} />
      ))}
    </div>
  );
}

/** Penpot SelectableItem — Selected: True · False. */
export function SelectableItem({ article, selected, onChange }: { article: Pick<Article, "title" | "author" | "publication" | "minutes">; selected: boolean; onChange: (selected: boolean) => void }) {
  return (
    <label className={`selectable-item ${selected ? "is-selected" : ""}`}>
      <Checkbox checked={selected} onChange={onChange} label={article.title} hideLabel />
      <span className="selectable-item__text">
        <span className="selectable-item__title">{article.title}</span>
        <span className="type-caption muted">
          {article.author} · {article.publication}
        </span>
      </span>
      <span className="type-label-sm selectable-item__minutes">{article.minutes} min</span>
    </label>
  );
}

/** Penpot SessionContentSelection — suggested pieces + running total against the chosen length. */
export function SessionContentSelection({ minutes, source, articles, selected, onChange }: { minutes: number; source: string; articles: Article[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const total = articles.filter((a) => selected.includes(a.id)).reduce((n, a) => n + a.minutes, 0);
  return (
    <div className="session-selection">
      <div className="session-selection__head">
        <h3 className="type-heading-4">Suggested for {minutes} minutes</h3>
        <span className="type-caption muted">from {source}</span>
      </div>
      {articles.map((a) => (
        <SelectableItem key={a.id} article={a} selected={selected.includes(a.id)} onChange={(v) => onChange(v ? [...selected, a.id] : selected.filter((x) => x !== a.id))} />
      ))}
      <div className="session-selection__total">
        <span className="type-label-sm muted-2">
          {selected.length} {selected.length === 1 ? "piece" : "pieces"} · {total} of {minutes} minutes
        </span>
        <span className="session-meter" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (total / minutes) * 100)}%` }} className={total > minutes ? "is-over" : ""} />
        </span>
      </div>
    </div>
  );
}

/** Penpot SessionTimer — remaining time, large and calm. */
export function SessionTimer({ remainingMs, minutes, paused }: { remainingMs: number; minutes: number; paused?: boolean }) {
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  return (
    <>
      <p className="focus-timer" role="timer" aria-live="off" aria-label={`${mm} minutes ${ss} seconds left`}>
        {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </p>
      <p className="type-body-md muted">{paused ? "paused" : `left of ${minutes} minutes`}</p>
    </>
  );
}

/** Penpot SessionProgress — one segment per piece; the current one fills with elapsed time. */
export function SessionProgress({ count, index, fraction, label }: { count: number; index: number; fraction: number; label: ReactNode }) {
  return (
    <div className="focus-active__progress">
      <div className="focus-segments">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="focus-segment">
            <span style={{ width: i < index ? "100%" : i === index ? `${Math.max(4, Math.min(100, fraction * 100))}%` : "0%" }} />
          </span>
        ))}
      </div>
      <span className="type-caption muted">{label}</span>
    </div>
  );
}

/** Penpot SessionControls — End · Pause/Resume · Next. */
export function SessionControls({ paused, canNext, onEnd, onTogglePause, onNext }: { paused: boolean; canNext: boolean; onEnd: () => void; onTogglePause: () => void; onNext: () => void }) {
  return (
    <div className="focus-controls">
      <Button intent="ghost" onClick={onEnd}>
        End session
      </Button>
      <button type="button" className="focus-controls__pause" onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"}>
        <Icon name={paused ? "play" : "pause"} />
      </button>
      <Button intent="ghost" onClick={onNext} disabled={!canNext}>
        Next piece
      </Button>
    </div>
  );
}

/** Penpot SessionCompletion — what the session added up to, and where to go next. */
export function SessionCompletion({ title, summary, pieces, minutes, highlights, onReview, onHome }: { title: string; summary: string; pieces: number; minutes: number; highlights: number; onReview: () => void; onHome: () => void }) {
  return (
    <section className="session-complete">
      <AppIcon size={72} />
      <h2 className="type-heading-2">{title}</h2>
      <p className="type-body-lg muted-2">{summary}</p>
      <dl className="reading-completion__stats session-complete__stats">
        <div>
          <dt className="type-caption muted">pieces</dt>
          <dd className="type-heading-3">{pieces}</dd>
        </div>
        <div>
          <dt className="type-caption muted">focused</dt>
          <dd className="type-heading-3">{minutes} min</dd>
        </div>
        <div>
          <dt className="type-caption muted">highlights</dt>
          <dd className="type-heading-3">{highlights}</dd>
        </div>
      </dl>
      <div className="session-complete__actions">
        <Button intent="secondary" size="lg" onClick={onReview}>
          Review highlights
        </Button>
        <Button intent="primary" size="lg" onClick={onHome}>
          Back to home
        </Button>
      </div>
    </section>
  );
}
