import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { SegmentedControl } from "../components/actions/SegmentedControl";
import { TextButton } from "../components/actions/TextLink";
import { ArticleCard } from "../components/content/ArticleCard";
import { ContentFilter } from "../components/content/ContentFilter";
import { FilterBar } from "../components/content/FilterBar";
import { TopicTag } from "../components/content/meta";
import { EmptyState } from "../components/feedback/EmptyState";
import { SearchInput } from "../components/forms/SearchInput";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { useIsCompact } from "../hooks/useMediaQuery";
import type { ContentType, ReadingStatus } from "../data/types";
import "./pages.css";

const TYPES = ["All", "Article", "Newsletter", "Video", "Audio"] as const;
const STATUSES = ["Any", "Unread", "In progress", "Completed"] as const;
const SAVED = ["Any time", "This week", "Earlier"] as const;
const SORTS = ["Recently saved", "Shortest first", "Longest first", "Title A–Z"] as const;

export function LibraryPage() {
  const { allArticles, getState, toggleBookmark } = useStore();
  const compact = useIsCompact();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [saved, setSaved] = useState<(typeof SAVED)[number]>("Any time");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Recently saved");
  const [view, setView] = useState<"List" | "Grid">("Grid");
  const [topic, setTopic] = useState("All topics");
  const status = (params.get("status") as (typeof STATUSES)[number]) ?? "Any";
  const setStatus = (s: (typeof STATUSES)[number]) => setParams(s === "Any" ? {} : { status: s }, { replace: true });

  const library = allArticles.filter((a) => !getState(a.id).archived);
  const topics = useMemo(() => ["All topics", ...Array.from(new Set(library.flatMap((a) => a.topics))).sort()], [library]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const weekAgo = Date.now() - 7 * 86_400_000;
    const list = library.filter((a) => {
      const st = getState(a.id);
      if (type !== "All" && a.type !== (type as ContentType)) return false;
      if (status !== "Any" && st.status !== (status as ReadingStatus)) return false;
      if (topic !== "All topics" && !a.topics.includes(topic)) return false;
      const t = new Date(a.savedAt).getTime();
      if (saved === "This week" && t < weekAgo) return false;
      if (saved === "Earlier" && t >= weekAgo) return false;
      if (q && ![a.title, a.author, a.publication, a.excerpt, ...a.topics].some((s) => s.toLowerCase().includes(q))) return false;
      return true;
    });
    const sorters: Record<(typeof SORTS)[number], (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      "Recently saved": (a, b) => b.savedAt.localeCompare(a.savedAt),
      "Shortest first": (a, b) => a.minutes - b.minutes,
      "Longest first": (a, b) => b.minutes - a.minutes,
      "Title A–Z": (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort(sorters[sort]);
  }, [library, query, type, status, topic, saved, sort, getState]);

  const filtered = type !== "All" || status !== "Any" || saved !== "Any time" || topic !== "All topics" || query;
  const clear = () => {
    setType("All");
    setStatus("Any");
    setSaved("Any time");
    setTopic("All topics");
    setQuery("");
  };
  const hours = Math.round(library.reduce((n, a) => n + a.minutes, 0) / 60);

  return (
    <Page title="My Library" eyebrow={`${library.length} pieces · ${hours} hours of reading`} mobileBar={<MobileTopBar type="brand" />} className="library">
      <div className="page-title-row">
        <div className="page-titles">
          {!compact && <p className="overline eyebrow">Everything you’ve kept</p>}
          <h2 className="type-display-l library__title">My Library</h2>
          {compact && <p className="type-caption muted">{library.length} pieces</p>}
        </div>
        <SearchInput className="library__search" value={query} onChange={setQuery} label="Search your library" placeholder={`Search ${library.length} pieces`} shortcut={compact ? undefined : "⌘K"} />
      </div>

      <FilterBar
        filters={
          <>
            <ContentFilter label="Type" options={TYPES} value={type} onChange={setType} />
            <ContentFilter label="Status" options={STATUSES} value={status} onChange={setStatus} />
            <ContentFilter label="Saved" options={SAVED} value={saved} onChange={setSaved} />
            {filtered && (
              <TextButton tone="muted" onClick={clear}>
                Clear
              </TextButton>
            )}
          </>
        }
        view={
          <>
            <ContentFilter label="Sort" options={SORTS} value={sort} onChange={setSort} />
            {!compact && <SegmentedControl label="View" options={["List", "Grid"] as const} value={view} onChange={setView} />}
          </>
        }
      />

      <div className="topic-row" role="group" aria-label="Topics">
        {topics.map((t) => (
          <TopicTag key={t} label={t === "All topics" && compact ? "All" : t} selected={topic === t} onClick={() => setTopic(t)} />
        ))}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {results.length} results
      </p>
      {results.length === 0 ? (
        <EmptyState kind="no-results" title={query ? `No matches for “${query}”` : "Nothing matches these filters"} description="Try a broader word, or clear the filters to see your whole library." action={<Button intent="ghost" onClick={clear}>Clear filters</Button>} />
      ) : view === "Grid" && !compact ? (
        <div className="card-grid card-grid--3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} layout="standard" state={getState(a.id)} onBookmark={() => toggleBookmark(a.id, getState(a.id).bookmarked)} />
          ))}
        </div>
      ) : (
        <div className={compact ? "stack" : "library__list"}>
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} layout="compact" state={getState(a.id)} onBookmark={() => toggleBookmark(a.id, getState(a.id).bookmarked)} />
          ))}
        </div>
      )}
    </Page>
  );
}
