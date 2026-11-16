import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "../app/store";
import { Button, ButtonLink } from "../components/actions/Button";
import { BookmarkButton } from "../components/actions/BookmarkButton";
import { IconButton } from "../components/actions/IconButton";
import { ArticleCard } from "../components/content/ArticleCard";
import { ContentCover } from "../components/content/ContentCover";
import { AuthorMetadata, DurationIndicator, durationLabel } from "../components/content/meta";
import { EmptyState } from "../components/feedback/EmptyState";
import { Modal } from "../components/feedback/Modal";
import { useToast } from "../components/feedback/Toast";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { Annotation } from "../components/reading/Annotation";
import { HighlightActionBar } from "../components/reading/HighlightActionBar";
import { ReaderFooter } from "../components/reading/ReaderFooter";
import { ReaderHeader } from "../components/reading/ReaderHeader";
import { ReadingCompletion } from "../components/reading/ReadingCompletion";
import { ReadingContentBlock } from "../components/reading/ReadingContentBlock";
import { ReadingPreferencesPanel } from "../components/reading/ReadingPreferences";
import { ReadingProgress } from "../components/reading/ReadingProgress";
import { ReadingToolbar } from "../components/reading/ReadingToolbar";
import { TableOfContents } from "../components/reading/TableOfContents";
import { AddToCollectionDialog } from "../features/collections/AddToCollectionDialog";
import { highlightsFromSegments, segmentsFromSelection, type SelectionSegment } from "../features/reader/selection";
import { useIsCompact } from "../hooks/useMediaQuery";
import type { Highlight, HighlightColor } from "../data/types";
import "./pages.css";

const LEADING = { Tight: 1.55, Comfortable: 1.7, Airy: 1.9 } as const;
const MEASURE = { Narrow: 560, Medium: 680, Wide: 800 } as const;
const FONT = { Literata: "var(--font-family-reading)", Inter: "var(--font-family-ui)", Fraunces: "var(--font-family-display)" } as const;

export function ReaderPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const store = useStore();
  const { state, getArticle, getState, toggleBookmark, setProgress, markFinished, addHighlights, updateHighlight, removeHighlightGroup } = store;
  const article = getArticle(id);
  const articleState = getState(id);
  const compact = useIsCompact();
  const toast = useToast();

  const articleRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [liveProgress, setLiveProgress] = useState(articleState.progress);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collectOpen, setCollectOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [bar, setBar] = useState<{ top: number; left: number; segments: SelectionSegment[] } | null>(null);
  const [annotation, setAnnotation] = useState<{ groupId: string; top: number; editing: boolean } | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const highlights = useMemo(() => state.highlights.filter((h) => h.articleId === id), [state.highlights, id]);
  const byBlock = useMemo(() => {
    const m: Record<string, Highlight[]> = {};
    for (const h of highlights) (m[h.blockId] ??= []).push(h);
    return m;
  }, [highlights]);
  const groups = useMemo(() => {
    const m = new Map<string, Highlight[]>();
    for (const h of highlights) m.set(h.groupId, [...(m.get(h.groupId) ?? []), h]);
    return [...m.values()];
  }, [highlights]);

  const r = state.prefs.reading;
  const readerStyle = {
    "--reader-size": `${r.fontSize}px`,
    "--reader-size-mobile": `${Math.max(16, r.fontSize - 2)}px`,
    "--reader-leading": LEADING[r.lineSpacing],
    "--reader-measure": `${MEASURE[r.width]}px`,
    "--reader-font": FONT[r.font],
  } as CSSProperties;

  // ----- Reading progress (persisted, debounced) -----
  const measure = useCallback(() => {
    const el = articleRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    return total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));
  }, []);

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const p = measure();
        setLiveProgress(p);
        const subs = Array.from(textRef.current?.querySelectorAll<HTMLElement>(".reading-block--subheading") ?? []);
        const current = subs.filter((s) => s.getBoundingClientRect().top < 160).pop();
        setActiveSection(current?.id ?? null);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const stored = getState(id);
          if (stored.status !== "Completed" && p > stored.progress + 0.01) setProgress(id, Math.round(p * 100) / 100);
        }, 400);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [id, measure, getState, setProgress]);

  // ----- Restore position, or jump to a highlight (?h=<groupId>) -----
  useLayoutEffect(() => {
    if (!article) return;
    const target = params.get("h");
    const run = () => {
      if (target) {
        const mark = document.querySelector<HTMLElement>(`[data-highlight-id^="${CSS.escape(target)}"]`);
        if (mark) {
          mark.scrollIntoView({ block: "center" });
          mark.classList.add("is-flash");
          setAnnotation(null);
          return;
        }
      }
      const p = getState(id).progress;
      const el = articleRef.current;
      if (el && p > 0.03 && p < 0.97) {
        const rect = el.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + rect.top + p * (rect.height - window.innerHeight * 0.6) });
      } else window.scrollTo({ top: 0 });
    };
    document.fonts?.ready.then(run) ?? run();
    // Only on entering an article.
  }, [id]);

  // ----- Text selection → HighlightActionBar -----
  useEffect(() => {
    const onUp = () => {
      window.setTimeout(() => {
        const sel = window.getSelection();
        const root = textRef.current;
        if (!root) return;
        const segments = segmentsFromSelection(root, sel);
        if (!segments.length || !sel || sel.rangeCount === 0) return setBar(null);
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setBar({ top: Math.max(rect.top, 120), left: Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180), segments });
      }, 0);
    };
    const onDown = (e: Event) => !(e.target as HTMLElement).closest(".highlight-bar") && setBar(null);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    const onSelectionChange = () => window.getSelection()?.isCollapsed && setBar(null);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mousedown", onDown);
    const onScroll = () => setBar(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const createHighlight = (color: HighlightColor, withNote = false) => {
    if (!bar) return;
    const created = highlightsFromSegments(id, bar.segments, color);
    addHighlights(created);
    window.getSelection()?.removeAllRanges();
    setBar(null);
    if (withNote) openAnnotation(created[0].groupId, true);
    else toast({ tone: "success", message: "Highlight saved", action: { label: "Add note", onClick: () => openAnnotation(created[0].groupId, true) } });
  };

  const openAnnotation = (groupId: string, editing = false) => {
    window.requestAnimationFrame(() => {
      const mark = document.querySelector<HTMLElement>(`[data-highlight-id^="${CSS.escape(groupId)}"]`);
      const rootTop = rootRef.current?.getBoundingClientRect().top ?? 0;
      const top = mark ? mark.getBoundingClientRect().top - rootTop - 8 : 200;
      setAnnotation({ groupId, top, editing });
    });
  };

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ tone: "success", message });
    } catch {
      toast({ tone: "error", message: "Couldn’t reach the clipboard" });
    }
  };

  if (!article) {
    return (
      <main className="reader reader--missing" id="main">
        <EmptyState kind="no-results" title="This piece isn’t in your library" description="It may have been removed, or the link is incomplete." action={<ButtonLink to="/library" intent="secondary">Back to library</ButtonLink>} />
      </main>
    );
  }

  const minutesLeft = Math.max(1, Math.round(article.minutes * (1 - liveProgress)));
  const finished = articleState.status === "Completed";
  const shownProgress = finished ? 1 : liveProgress;
  const toc = article.body.filter((b) => b.type === "subheading").map((b) => ({ id: b.id, label: b.text }));
  const collection = state.collections.find((c) => c.articleIds.includes(article.id));
  const nextArticle =
    (collection?.articleIds.map(getArticle).find((a) => a && a.id !== id && getState(a.id).status !== "Completed")) ??
    store.allArticles.find((a) => a.id !== id && getState(a.id).status === "Unread" && a.type === "Article");
  const activeGroup = annotation ? groups.find((g) => g[0].groupId === annotation.groupId) : undefined;
  const notes = highlights.filter((h) => h.note).length;

  const finish = () => {
    markFinished(id);
    setLiveProgress(1);
    setCompletionOpen(true);
  };

  const annotationEl = activeGroup && (
    <Annotation
      highlight={{ ...activeGroup[0], text: activeGroup.map((h) => h.text).join(" … ") }}
      startEditing={annotation?.editing}
      className={compact ? "" : "annotation--floating"}
      style={compact ? undefined : { top: annotation?.top, left: "calc(50% + var(--reader-measure, 680px) / 2 + 40px)" }}
      onSave={(note) => updateHighlight(activeGroup[0].id, { note: note || undefined })}
      onDelete={() => {
        removeHighlightGroup(activeGroup[0].groupId);
        setAnnotation(null);
        toast({ tone: "neutral", message: "Highlight removed", action: { label: "Undo", onClick: () => addHighlights(activeGroup) } });
      }}
      onClose={() => setAnnotation(null)}
    />
  );

  return (
    <div className="reader" style={readerStyle} ref={rootRef}>
      <a href="#main" className="skip-link">
        Skip to article
      </a>
      {compact ? (
        <div className="reader__mobile-bar">
          <MobileTopBar
            type="reader"
            title={article.publication}
            back="/library"
            actions={
              <>
                <IconButton icon="type" label="Reading preferences" onClick={() => setPrefsOpen(true)} />
                <BookmarkButton saved={articleState.bookmarked} onToggle={() => toggleBookmark(id, articleState.bookmarked)} title={article.title} />
              </>
            }
          />
          <ReadingProgress value={shownProgress} />
        </div>
      ) : (
        <ReaderHeader
          publication={article.publication}
          title={article.title}
          progress={shownProgress}
          timeLeft={finished ? "Finished" : `${minutesLeft} min left`}
          bookmarked={articleState.bookmarked}
          prefsOpen={prefsOpen}
          onBookmark={() => toggleBookmark(id, articleState.bookmarked)}
          onPreferences={() => setPrefsOpen((o) => !o)}
          onHighlights={() => setDrawerOpen(true)}
          onCollect={() => setCollectOpen(true)}
          backTo="/library"
          backLabel="Library"
        />
      )}

      <div className="reader__body">
        <aside className="reader__aside reader__aside--left">
          <div className="reader__aside-inner">
            <TableOfContents items={toc} active={activeSection} onSelect={(sid) => document.getElementById(sid)?.scrollIntoView({ behavior: "smooth", block: "start" })} />
          </div>
        </aside>

        <article className="reader__article" ref={articleRef} id="main" aria-labelledby="reader-title">
          <header className="reader__head">
            <p className="overline reader__kicker">
              {article.publication} · {article.type === "Article" ? "Essay" : article.type} · {article.topics[0]}
            </p>
            <h1 id="reader-title" className="reader__title">
              {article.title}
            </h1>
            <p className="reader__dek">{article.dek}</p>
            <div className="reader__byline">
              <AuthorMetadata author={article.author} initials={article.authorInitials} publication={article.publication} />
              <div className="reader__meta">
                <DurationIndicator label={durationLabel(article.type, article.minutes)} />
                <span className="type-caption">Saved {new Date(article.savedAt).toLocaleDateString("en-GB", { weekday: "long" })}</span>
              </div>
            </div>
          </header>

          <figure className="reader__figure">
            <div className="reader__image">
              <ContentCover tone={article.cover} />
            </div>
            {article.coverCaption && <figcaption className="reader__caption">{article.coverCaption}</figcaption>}
          </figure>

          <div className="reader__text" ref={textRef}>
            {article.body.map((b) => (
              <ReadingContentBlock key={b.id} block={b} author={article.author} highlights={byBlock[b.id] ?? []} activeHighlight={annotation?.groupId} onHighlightClick={(h) => openAnnotation(h.groupId)} />
            ))}
          </div>

          <ReaderFooter article={article} finished={finished} onFinish={finish} onCollect={() => setCollectOpen(true)} />
        </article>

        <aside className={`reader__aside reader__aside--right ${annotation ? "is-hidden" : ""}`} aria-label="Reading tools">
          <div className="reader__aside-inner">
            <ReadingToolbar
              orientation="rail"
              title={article.title}
              bookmarked={articleState.bookmarked}
              prefsOpen={prefsOpen}
              onPreferences={() => setPrefsOpen((o) => !o)}
              onHighlights={() => setDrawerOpen(true)}
              onBookmark={() => toggleBookmark(id, articleState.bookmarked)}
              onShare={() => copy(window.location.href, "Link copied")}
            />
          </div>
        </aside>
      </div>

      {compact && (
        <ReadingToolbar
          orientation="pill"
          title={article.title}
          bookmarked={articleState.bookmarked}
          prefsOpen={prefsOpen}
          onPreferences={() => setPrefsOpen(true)}
          onHighlights={() => setDrawerOpen(true)}
          onBookmark={() => toggleBookmark(id, articleState.bookmarked)}
          onShare={() => copy(window.location.href, "Link copied")}
        />
      )}

      {bar && (
        <HighlightActionBar
          top={bar.top}
          left={bar.left}
          onHighlight={(c) => createHighlight(c)}
          onNote={() => createHighlight("honey", true)}
          onCopy={() => {
            copy(bar.segments.map((s) => s.text).join("\n\n"), "Quote copied");
            setBar(null);
          }}
        />
      )}

      {!compact && prefsOpen && (
        <div className="reading-prefs--popover" role="dialog" aria-label="Reading preferences">
          <ReadingPreferencesPanel onClose={() => setPrefsOpen(false)} />
        </div>
      )}
      {compact && (
        <Modal open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Reading preferences">
          <ReadingPreferencesPanel embedded showWidth={false} />
        </Modal>
      )}

      {!compact && annotationEl}
      {compact && (
        <Modal open={!!activeGroup} onClose={() => setAnnotation(null)} title="Highlight">
          {annotationEl}
        </Modal>
      )}

      <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Highlights · ${groups.length}`} subtitle={article.title} placement="end" width={400}>
        {groups.length === 0 ? (
          <p className="type-body-md muted">Select any passage to highlight it. Your highlights and notes will gather here.</p>
        ) : (
          <ul className="drawer-highlights">
            {groups.map((g) => (
              <li key={g[0].groupId}>
                <button
                  type="button"
                  className="drawer-highlight"
                  onClick={() => {
                    setDrawerOpen(false);
                    const mark = document.querySelector<HTMLElement>(`[data-highlight-id^="${CSS.escape(g[0].groupId)}"]`);
                    mark?.scrollIntoView({ behavior: "smooth", block: "center" });
                    window.setTimeout(() => openAnnotation(g[0].groupId), 450);
                  }}
                >
                  <span className={`drawer-highlight__rule annotation__rule--${g[0].color ?? "honey"}`} aria-hidden="true" />
                  <span className="drawer-highlight__text">
                    <span className="drawer-highlight__quote">{g.map((h) => h.text).join(" … ")}</span>
                    {g[0].note && <span className="type-body-sm muted-2">{g[0].note}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <AddToCollectionDialog open={collectOpen} articleIds={[id]} onClose={() => setCollectOpen(false)} />

      <Modal open={completionOpen} onClose={() => setCompletionOpen(false)} title="Finished" width={560}>
        <ReadingCompletion
          minutes={article.minutes}
          highlights={groups.length}
          notes={notes}
          collectionName={collection?.name}
          next={nextArticle && <ArticleCard article={nextArticle} layout="compact" state={getState(nextArticle.id)} onBookmark={() => toggleBookmark(nextArticle.id, getState(nextArticle.id).bookmarked)} />}
          actions={
            <>
              <Button intent="secondary" onClick={() => navigate("/highlights")}>
                Review highlights
              </Button>
              <Button intent="ghost" onClick={() => navigate("/library")}>
                Back to library
              </Button>
            </>
          }
        />
      </Modal>
      <span className="visually-hidden">
        <Link to="/library">Back to library</Link>
      </span>
    </div>
  );
}
