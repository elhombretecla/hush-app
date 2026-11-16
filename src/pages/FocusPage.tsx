import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { Icon } from "../components/brand/Icon";
import { AppIcon, Wordmark } from "../components/brand/Wordmark";
import { Checkbox } from "../components/forms/Checkbox";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { useFocusSession } from "../features/focus/useFocusSession";
import { useIsCompact } from "../hooks/useMediaQuery";
import "./pages.css";

const DURATIONS = [
  { minutes: 10, hint: "One short essay" },
  { minutes: 20, hint: "Two pieces, unhurried" },
  { minutes: 30, hint: "A long read, start to finish" },
] as const;

export function FocusPage() {
  const { state, allArticles, getArticle, getState } = useStore();
  const compact = useIsCompact();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const focus = useFocusSession();
  const collectionId = params.get("collection") ?? "better-attention";
  const collection = state.collections.find((c) => c.id === collectionId) ?? state.collections[0];
  const [minutes, setMinutes] = useState(20);

  const pool = useMemo(() => {
    const fromCollection = collection.articleIds.map(getArticle).filter((a): a is NonNullable<typeof a> => !!a);
    const others = allArticles.filter((a) => !collection.articleIds.includes(a.id));
    return [...fromCollection, ...others].filter((a) => getState(a.id).status !== "Completed" && (a.type === "Article" || a.type === "Newsletter")).slice(0, 6);
  }, [collection, allArticles, getArticle, getState]);

  const suggest = (limit: number) => {
    const picked: string[] = [];
    let total = 0;
    for (const a of [...pool].sort((x, y) => x.minutes - y.minutes)) if (total + a.minutes <= limit) (picked.push(a.id), (total += a.minutes));
    return picked;
  };
  const [selected, setSelected] = useState<string[]>(() => suggest(20));
  // Re-suggest whenever the length changes.
  useEffect(() => setSelected(suggest(minutes)), [minutes, pool.length]);
  const total = selected.reduce((n, id) => n + (getArticle(id)?.minutes ?? 0), 0);

  // ----- Active session -----
  if (focus.session && !focus.session.completedAt) {
    const s = focus.session;
    const current = getArticle(s.articleIds[s.index]);
    const mm = Math.floor(focus.remainingMs / 60000);
    const ss = Math.floor((focus.remainingMs % 60000) / 1000);
    return (
      <div className="focus-active" role="region" aria-label="Focus session">
        <div className="focus-active__top">
          <Wordmark variant="compact" size={34} />
          <div className="focus-active__progress">
            <div className="focus-segments">
              {s.articleIds.map((aid, i) => (
                <span key={aid} className="focus-segment">
                  <span style={{ width: i < s.index ? "100%" : i === s.index ? `${Math.max(4, Math.min(100, (focus.elapsedMs / (s.minutes * 60000)) * 100))}%` : "0%" }} />
                </span>
              ))}
            </div>
            <span className="type-caption muted">
              {s.index + 1} of {s.articleIds.length} · {current?.publication}
            </span>
          </div>
        </div>
        <div className="focus-active__center">
          <p className="focus-timer" role="timer" aria-live="off" aria-label={`${mm} minutes ${ss} seconds left`}>
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </p>
          <p className="type-body-md muted">{s.pausedAt ? "paused" : `left of ${s.minutes} minutes`}</p>
          {current && (
            <div className="focus-now">
              <span className="overline eyebrow">Now reading · {current.publication}</span>
              <h1 className="type-heading-1 focus-now__title">{current.title}</h1>
              <span className="type-body-md muted">
                {current.author} · {current.minutes} min read
              </span>
              <Button intent="primary" size="lg" onClick={() => navigate(`/read/${current.id}`)}>
                Continue reading
              </Button>
            </div>
          )}
        </div>
        <div className="focus-controls">
          <Button intent="ghost" onClick={focus.finish}>
            End session
          </Button>
          <button type="button" className="focus-controls__pause" onClick={focus.togglePause} aria-label={s.pausedAt ? "Resume" : "Pause"}>
            <Icon name={s.pausedAt ? "play" : "pause"} />
          </button>
          <Button intent="ghost" onClick={focus.next} disabled={s.index >= s.articleIds.length - 1}>
            Next piece
          </Button>
        </div>
      </div>
    );
  }

  // ----- Completion -----
  if (focus.session?.completedAt) {
    const s = focus.session;
    const mins = Math.max(1, Math.round(focus.elapsedMs / 60000));
    const hl = state.highlights.filter((h) => s.articleIds.includes(h.articleId) && new Date(h.createdAt).getTime() >= s.startedAt);
    const hlCount = new Set(hl.map((h) => h.groupId)).size;
    return (
      <Page title="Focus Sessions" eyebrow="Session complete" mobileBar={<MobileTopBar type="title" title="Focus session" back="/" />}>
        <section className="session-complete">
          <AppIcon size={72} />
          <h2 className="type-heading-2">{mins >= s.minutes ? `${["Ten", "Twenty", "Thirty"][s.minutes / 10 - 1] ?? s.minutes} quiet minutes.` : `${mins} quiet minutes.`}</h2>
          <p className="type-body-lg muted-2">
            You read {s.index + 1} {s.index ? "pieces" : "piece"}
            {hlCount ? ` and kept ${hlCount} ${hlCount === 1 ? "highlight" : "highlights"}` : ""}. That’s enough for today.
          </p>
          <dl className="reading-completion__stats session-complete__stats">
            <div>
              <dt className="type-caption muted">pieces</dt>
              <dd className="type-heading-3">{s.index + 1}</dd>
            </div>
            <div>
              <dt className="type-caption muted">focused</dt>
              <dd className="type-heading-3">{mins} min</dd>
            </div>
            <div>
              <dt className="type-caption muted">highlights</dt>
              <dd className="type-heading-3">{hlCount}</dd>
            </div>
          </dl>
          <div className="session-complete__actions">
            <Button intent="secondary" size="lg" onClick={() => (focus.clear(), navigate("/highlights"))}>
              Review highlights
            </Button>
            <Button intent="primary" size="lg" onClick={() => (focus.clear(), navigate("/"))}>
              Back to home
            </Button>
          </div>
        </section>
      </Page>
    );
  }

  // ----- Setup -----
  return (
    <Page title="Focus Sessions" eyebrow="No notifications · no tabs" mobileBar={<MobileTopBar type="title" title="Focus session" back="/" />} className="focus-setup">
      <div className="page-titles focus-setup__titles">
        <p className="overline eyebrow">Focus session</p>
        <h2 className={compact ? "type-heading-1" : "type-display-xl"}>What do you have time for?</h2>
        <p className="type-body-lg muted-2">Pick a length. We’ll gather pieces that fit and hide everything else until you’re done.</p>
      </div>
      <div className="focus-setup__grid">
        <div className="duration-options" role="radiogroup" aria-label="Session length">
          {DURATIONS.map((d) => {
            const sel = d.minutes === minutes;
            return (
              <button key={d.minutes} type="button" role="radio" aria-checked={sel} className={`duration-option ${sel ? "is-selected" : ""}`} onClick={() => setMinutes(d.minutes)}>
                <span className="duration-option__top">
                  <Icon name="clock" />
                  {sel && <Icon name="check" />}
                </span>
                <span className="duration-option__value">
                  <span className="duration-option__minutes">{d.minutes}</span>
                  <span className="duration-option__unit">min</span>
                </span>
                <span className="duration-option__hint">{d.hint}</span>
              </button>
            );
          })}
        </div>
        <div className="session-selection">
          <div className="session-selection__head">
            <h3 className="type-heading-4">Suggested for {minutes} minutes</h3>
            <span className="type-caption muted">from {collection.name}</span>
          </div>
          {pool.map((a) => {
            const on = selected.includes(a.id);
            return (
              <label key={a.id} className={`selectable-item ${on ? "is-selected" : ""}`}>
                <Checkbox checked={on} onChange={(v) => setSelected((p) => (v ? [...p, a.id] : p.filter((x) => x !== a.id)))} label={a.title} hideLabel />
                <span className="selectable-item__text">
                  <span className="selectable-item__title">{a.title}</span>
                  <span className="type-caption muted">
                    {a.author} · {a.publication}
                  </span>
                </span>
                <span className="type-label-sm selectable-item__minutes">{a.minutes} min</span>
              </label>
            );
          })}
          <div className="session-selection__total">
            <span className="type-label-sm muted-2">
              {selected.length} {selected.length === 1 ? "piece" : "pieces"} · {total} of {minutes} minutes
            </span>
            <span className="session-meter" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (total / minutes) * 100)}%` }} className={total > minutes ? "is-over" : ""} />
            </span>
          </div>
        </div>
      </div>
      <div className="focus-setup__start">
        <span className="type-body-sm muted">Do not disturb is on for the whole session. You can pause any time.</span>
        <Button intent="primary" size="lg" disabled={!selected.length} onClick={() => focus.start(minutes, pool.filter((a) => selected.includes(a.id)).map((a) => a.id))}>
          Start {minutes}-minute session
        </Button>
      </div>
    </Page>
  );
}
