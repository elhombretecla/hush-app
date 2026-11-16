import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { Icon } from "../components/brand/Icon";
import { ArticleCard } from "../components/content/ArticleCard";
import { ContentCover } from "../components/content/ContentCover";
import { TopicTag } from "../components/content/meta";
import { EmptyState } from "../components/feedback/EmptyState";
import { SearchInput } from "../components/forms/SearchInput";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { Tabs } from "../components/navigation/Tabs";
import "./pages.css";

type Scope = "all" | "pieces" | "highlights" | "collections";

export function SearchPage() {
  const { state, allArticles, getArticle, getState, toggleBookmark, addSearch } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return { pieces: [], highlights: [], collections: [] };
    const has = (...s: (string | undefined)[]) => s.some((x) => x?.toLowerCase().includes(q));
    return {
      pieces: allArticles.filter((a) => !getState(a.id).archived && (has(a.title, a.author, a.publication, a.excerpt, ...a.topics) || a.body.some((b) => has(b.text)))),
      highlights: state.highlights.filter((h) => has(h.text, h.note)),
      collections: state.collections.filter((c) => has(c.name, c.description)),
    };
  }, [q, allArticles, state.highlights, state.collections, getState]);
  const total = results.pieces.length + results.highlights.length + results.collections.length;
  const topics = Array.from(new Set(allArticles.flatMap((a) => a.topics))).sort();
  const commit = () => q && addSearch(query);

  return (
    <Page title="Search" eyebrow={q ? `“${query.trim()}” · ${total} results` : "Titles, authors, highlights and notes"} mobileBar={<MobileTopBar type="title" title="Search" back="/" />} className="search">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <SearchInput value={query} onChange={setQuery} label="Search titles, authors, highlights and notes" placeholder="Search titles, authors, highlights" autoFocus />
      </form>

      {!q ? (
        <div className="search-start">
          <section className="search-start__recent" aria-labelledby="recent-searches">
            <h2 id="recent-searches" className="overline muted">
              Recent searches
            </h2>
            <ul>
              {state.recentSearches.map((s) => (
                <li key={s}>
                  <button type="button" className="recent-search" onClick={() => setQuery(s)}>
                    <Icon name="clock" />
                    <span>{s}</span>
                    <Icon name="arrow-right" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="search-start__topics" aria-labelledby="suggested-topics">
            <h2 id="suggested-topics" className="overline muted">
              Suggested topics
            </h2>
            <div className="topic-row topic-row--wrap">
              {topics.map((t) => (
                <TopicTag key={t} label={t} onClick={() => setQuery(t)} />
              ))}
            </div>
            <div className="search-tip">
              <p className="type-label-md">Search inside what you highlighted</p>
              <p className="type-body-sm muted-2">Try a phrase you half-remember — “the margin” or “long way” — and we’ll find the passage.</p>
            </div>
          </section>
        </div>
      ) : total === 0 ? (
        <EmptyState kind="no-results" title={`No matches for “${query.trim()}”`} description="Try a broader word, or search inside highlights and notes instead." action={<Button intent="ghost" onClick={() => setQuery("")}>Clear search</Button>} />
      ) : (
        <>
          <Tabs<Scope>
            label="Result type"
            value={scope}
            onChange={setScope}
            tabs={[
              { value: "all", label: `All ${total}` },
              { value: "pieces", label: `Pieces ${results.pieces.length}` },
              { value: "highlights", label: `Highlights ${results.highlights.length}` },
              { value: "collections", label: `Collections ${results.collections.length}` },
            ]}
          />
          <div className="search-results">
            {(scope === "all" || scope === "pieces") && results.pieces.length > 0 && (
              <section className="search-results__pieces" aria-label="Pieces">
                <h2 className="overline muted">Pieces</h2>
                {results.pieces.map((a) => (
                  <div key={a.id} onClickCapture={commit}>
                    <ArticleCard article={a} layout="compact" state={getState(a.id)} onBookmark={() => toggleBookmark(a.id, getState(a.id).bookmarked)} />
                  </div>
                ))}
              </section>
            )}
            <div className="search-results__side">
              {(scope === "all" || scope === "highlights") && results.highlights.length > 0 && (
                <section aria-label="Highlights">
                  <h2 className="overline muted">In your highlights</h2>
                  {results.highlights.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      className="highlight-result"
                      onClick={() => {
                        commit();
                        navigate(`/read/${h.articleId}?h=${h.groupId}`);
                      }}
                    >
                      <span className="highlight-result__quote">“{h.text}”</span>
                      <span className="type-caption muted">{getArticle(h.articleId)?.title}</span>
                    </button>
                  ))}
                </section>
              )}
              {(scope === "all" || scope === "collections") && results.collections.length > 0 && (
                <section aria-label="Collections">
                  <h2 className="overline muted">Collections</h2>
                  {results.collections.map((c) => (
                    <Link key={c.id} to={`/collections/${c.id}`} className="collection-option" onClick={commit}>
                      <span className="collection-option__thumb" aria-hidden="true">
                        <ContentCover tone={c.covers[2]} />
                      </span>
                      <span className="collection-option__text">
                        <span className="type-label-md">{c.name}</span>
                        <span className="type-caption muted">{c.articleIds.length} pieces</span>
                      </span>
                    </Link>
                  ))}
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
