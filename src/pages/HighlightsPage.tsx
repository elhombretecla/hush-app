import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { IconButton } from "../components/actions/IconButton";
import { TextButton } from "../components/actions/TextLink";
import { Icon } from "../components/brand/Icon";
import { ArticleCard } from "../components/content/ArticleCard";
import { ContentFilter } from "../components/content/ContentFilter";
import { TopicTag } from "../components/content/meta";
import { EmptyState } from "../components/feedback/EmptyState";
import { Modal } from "../components/feedback/Modal";
import { SearchInput } from "../components/forms/SearchInput";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { Tabs } from "../components/navigation/Tabs";
import { useIsCompact } from "../hooks/useMediaQuery";
import type { Highlight } from "../data/types";
import "./pages.css";

type Tab = "all" | "quotes" | "notes";

export function HighlightsPage() {
  const { state, getArticle, getState, toggleBookmark } = useStore();
  const compact = useIsCompact();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [collection, setCollection] = useState("Any collection");
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(0);

  const groups = useMemo(() => {
    const m = new Map<string, Highlight[]>();
    for (const h of state.highlights) m.set(h.groupId, [...(m.get(h.groupId) ?? []), h]);
    return [...m.values()].sort((a, b) => b[0].createdAt.localeCompare(a[0].createdAt));
  }, [state.highlights]);
  const collectionOf = (articleId: string) => state.collections.find((c) => c.articleIds.includes(articleId));
  const text = (g: Highlight[]) => g.map((h) => h.text).join(" … ");

  const filtered = groups.filter((g) => {
    const h = g[0];
    const a = getArticle(h.articleId);
    if (tab === "notes" && !h.note) return false;
    if (tab === "quotes" && h.note) return false;
    if (collection !== "Any collection" && collectionOf(h.articleId)?.name !== collection) return false;
    const q = query.trim().toLowerCase();
    if (q && ![text(g), h.note ?? "", a?.title ?? "", a?.author ?? ""].some((s) => s.toLowerCase().includes(q))) return false;
    return true;
  });
  const resurfaced = groups.length ? groups[(groups.length - 1 + shuffle) % groups.length] : null;
  const active = groups.find((g) => g[0].groupId === selected);
  const articleCount = new Set(state.highlights.map((h) => h.articleId)).size;
  const columns = compact ? [filtered] : [filtered.filter((_, i) => i % 2 === 0), filtered.filter((_, i) => i % 2 === 1)];

  const card = (g: Highlight[]) => {
    const h = g[0];
    const a = getArticle(h.articleId);
    const c = collectionOf(h.articleId);
    return (
      <article key={h.groupId} className={`highlight-card ${selected === h.groupId ? "is-selected" : ""}`}>
        <button type="button" className="highlight-card__open" onClick={() => setSelected(h.groupId)} aria-label={`Open highlight from ${a?.title}`} />
        <blockquote className="highlight-card__passage">
          <span className={`highlight-card__rule annotation__rule--${h.color ?? "honey"}`} aria-hidden="true" />
          <p>{text(g)}</p>
        </blockquote>
        {h.note && (
          <p className="highlight-card__note">
            <Icon name="note" />
            {h.note}
          </p>
        )}
        <footer className="highlight-card__footer">
          <span className="highlight-card__source">
            <span className="type-label-sm">{a?.title}</span>
            <span className="type-caption muted">
              {a?.author} · highlighted {new Date(h.createdAt).toLocaleDateString("en-GB", { weekday: "long" })}
            </span>
          </span>
          {c && !compact && <TopicTag label={c.name} />}
          <IconButton icon="external" label="Open in article" onClick={() => navigate(`/read/${h.articleId}?h=${h.groupId}`)} />
        </footer>
      </article>
    );
  };

  return (
    <Page title="Highlights & Notes" eyebrow={`${groups.length} passages from ${articleCount} pieces`} mobileBar={<MobileTopBar type="brand" />} className="highlights">
      <div className="page-title-row">
        <div className="page-titles">
          {!compact && <p className="overline eyebrow">What you wanted to remember</p>}
          <h2 className="type-display-l">{compact ? "Highlights" : "Highlights & Notes"}</h2>
        </div>
        <SearchInput className="library__search" value={query} onChange={setQuery} label="Search your highlights" placeholder="Search your highlights" />
      </div>

      {resurfaced && !query && (
        <section className="resurfaced" aria-label="Resurfaced today">
          <div className="resurfaced__quote">
            <p className="overline resurfaced__eyebrow">Resurfaced today</p>
            <p className="resurfaced__passage">“{text(resurfaced)}”</p>
            <p className="type-label-sm muted-2">
              {getArticle(resurfaced[0].articleId)?.author} · {getArticle(resurfaced[0].articleId)?.title}
            </p>
          </div>
          <div className="resurfaced__actions">
            <Button intent="secondary" onClick={() => navigate(`/read/${resurfaced[0].articleId}?h=${resurfaced[0].groupId}`)}>
              Open in article
            </Button>
            <TextButton tone="muted" arrow onClick={() => setShuffle((s) => s + 1)}>
              Show another
            </TextButton>
          </div>
        </section>
      )}

      <div className="highlights__controls">
        <Tabs<Tab>
          label="Highlight type"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: `All ${groups.length}` },
            { value: "quotes", label: `Quotes ${groups.filter((g) => !g[0].note).length}` },
            { value: "notes", label: `With notes ${groups.filter((g) => g[0].note).length}` },
          ]}
        />
        <ContentFilter label="Collection" options={["Any collection", ...state.collections.map((c) => c.name)]} value={collection} onChange={setCollection} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState kind="no-results" title="No highlights match" description="Select any passage while reading to keep it here." />
      ) : (
        <div className="highlight-columns">
          {columns.map((col, i) => (
            <div key={i} className="highlight-column">
              {col.map(card)}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setSelected(null)} title="Highlight" placement="end" width={440}>
        {active && (
          <div className="passage-panel">
            <blockquote className="passage-panel__quote">
              <span className={`highlight-card__rule annotation__rule--${active[0].color ?? "honey"}`} aria-hidden="true" />
              <p>{text(active)}</p>
            </blockquote>
            {active[0].note && (
              <div className="passage-panel__note">
                <span className="overline muted">Your note</span>
                <p className="type-body-md">{active[0].note}</p>
              </div>
            )}
            <span className="overline muted">From</span>
            {(() => {
              const a = getArticle(active[0].articleId);
              return a && <ArticleCard article={a} layout="compact" state={getState(a.id)} onBookmark={() => toggleBookmark(a.id, getState(a.id).bookmarked)} />;
            })()}
            <div className="passage-panel__actions">
              <Button intent="primary" size="lg" onClick={() => navigate(`/read/${active[0].articleId}?h=${active[0].groupId}`)}>
                Open in article
              </Button>
              <Button intent="secondary" size="lg" onClick={() => navigator.clipboard?.writeText(`“${text(active)}”`)}>
                Copy quote
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}
