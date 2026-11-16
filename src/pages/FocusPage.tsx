import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { Wordmark } from "../components/brand/Wordmark";
import { SessionCompletion, SessionContentSelection, SessionControls, SessionDurationSelector, SessionProgress, SessionTimer } from "../components/focus/Session";
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

  // ----- Active session -----
  if (focus.session && !focus.session.completedAt) {
    const s = focus.session;
    const current = getArticle(s.articleIds[s.index]);
    return (
      <div className="focus-active" role="region" aria-label="Focus session">
        <div className="focus-active__top">
          <Wordmark variant="compact" size={34} />
          <SessionProgress count={s.articleIds.length} index={s.index} fraction={focus.elapsedMs / (s.minutes * 60000)} label={`${s.index + 1} of ${s.articleIds.length} · ${current?.publication ?? ""}`} />
        </div>
        <div className="focus-active__center">
          <SessionTimer remainingMs={focus.remainingMs} minutes={s.minutes} paused={!!s.pausedAt} />
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
        <SessionControls paused={!!s.pausedAt} canNext={s.index < s.articleIds.length - 1} onEnd={focus.finish} onTogglePause={focus.togglePause} onNext={focus.next} />
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
        <SessionCompletion
          title={mins >= s.minutes ? `${["Ten", "Twenty", "Thirty"][s.minutes / 10 - 1] ?? s.minutes} quiet minutes.` : `${mins} quiet minutes.`}
          summary={`You read ${s.index + 1} ${s.index ? "pieces" : "piece"}${hlCount ? ` and kept ${hlCount} ${hlCount === 1 ? "highlight" : "highlights"}` : ""}. That’s enough for today.`}
          pieces={s.index + 1}
          minutes={mins}
          highlights={hlCount}
          onReview={() => (focus.clear(), navigate("/highlights"))}
          onHome={() => (focus.clear(), navigate("/"))}
        />
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
        <SessionDurationSelector options={DURATIONS} value={minutes} onChange={setMinutes} />
        <SessionContentSelection minutes={minutes} source={collection.name} articles={pool} selected={selected} onChange={setSelected} />
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
