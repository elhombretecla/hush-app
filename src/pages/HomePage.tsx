import { useNavigate } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { TextLink } from "../components/actions/TextLink";
import { Icon } from "../components/brand/Icon";
import { ArticleCard } from "../components/content/ArticleCard";
import { CollectionCard } from "../components/content/CollectionCard";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { useIsCompact } from "../hooks/useMediaQuery";
import { collectionProgress, greeting, todayLabel } from "../utils/format";
import { userProfile } from "../data/seed";
import "./pages.css";

export function HomePage() {
  const { state, allArticles, getArticle, getState, toggleBookmark } = useStore();
  const compact = useIsCompact();
  const navigate = useNavigate();
  const visible = allArticles.filter((a) => !getState(a.id).archived);
  const inProgress = visible.filter((a) => getState(a.id).status === "In progress");
  const continueArticle = inProgress[0] ?? visible.find((a) => getState(a.id).status === "Unread");
  const userSaved = state.savedArticles.map((a) => a.id);
  const recentIds = [...new Set([...userSaved, "slow-season", "empty-space", "quiet-hour-18"])].slice(0, 3);
  const recent = recentIds.map(getArticle).filter((a): a is NonNullable<typeof a> => !!a && a.id !== continueArticle?.id);
  const inboxCount = visible.filter((a) => getState(a.id).inInbox).length;
  const card = (id: string) => ({ state: getState(id), onBookmark: () => toggleBookmark(id, getState(id).bookmarked) });

  return (
    <Page title="Home" eyebrow={todayLabel()} mobileBar={<MobileTopBar type="brand" />} className="home">
      <section className="home-hero" aria-labelledby="home-headline">
        <div className="home-hero__greeting">
          <p className="overline eyebrow">
            {greeting()}, {userProfile.name.split(" ")[0]}
          </p>
          <h2 id="home-headline" className="type-display-xl home-hero__headline">
            A little more room to think.
          </h2>
          <p className="type-body-lg home-hero__supporting">Good things are worth returning to. Here’s what’s waiting for you.</p>
        </div>
        {!compact && (
          <aside className="home-today" aria-label="Waiting quietly">
            <span className="overline muted">Waiting quietly</span>
            <p className="type-body-sm">
              {inboxCount} pieces in your inbox, {inProgress.length} you started, and one collection you haven’t opened in a while.
            </p>
            <TextLink to="/inbox">Open inbox</TextLink>
          </aside>
        )}
      </section>

      {continueArticle && (
        <section className="section" aria-labelledby="continue-heading">
          <div className="section-head">
            <h2 id="continue-heading" className={compact ? "overline muted" : "type-heading-3"}>
              Continue reading
            </h2>
            {!compact && (
              <TextLink to="/library?status=In%20progress" tone="muted">
                All in progress
              </TextLink>
            )}
          </div>
          <div className="home-continue">
            <ArticleCard article={continueArticle} layout={compact ? "compact" : "featured"} {...card(continueArticle.id)} />
            {compact ? (
              <button type="button" className="focus-strip" onClick={() => navigate("/focus")}>
                <Icon name="focus" />
                <span className="focus-strip__text">
                  <span className="type-label-md">Have twenty minutes?</span>
                  <span className="type-caption">Two short pieces, no tabs.</span>
                </span>
                <Icon name="arrow-right" />
              </button>
            ) : (
              <aside className="focus-invite" aria-labelledby="focus-invite-title">
                <div className="focus-invite__top">
                  <Icon name="focus" />
                  <h3 id="focus-invite-title" className="type-heading-2">
                    Have twenty minutes?
                  </h3>
                  <p className="type-body-sm">Two short pieces from Better Attention fit neatly — no tabs, no notifications.</p>
                </div>
                <div className="focus-invite__bottom">
                  <span className="type-caption">Doing Less · Fewer Tabs</span>
                  <Button intent="secondary" fullWidth onClick={() => navigate("/focus")}>
                    Start a focus session
                  </Button>
                </div>
              </aside>
            )}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="recent-heading">
        <div className="section-head">
          <h2 id="recent-heading" className={compact ? "overline muted" : "type-heading-3"}>
            Recently saved
          </h2>
          {!compact && (
            <TextLink to="/inbox" tone="muted">
              Go to inbox
            </TextLink>
          )}
        </div>
        <div className={compact ? "stack" : "home-recent"}>
          {recent.map((a) => (
            <ArticleCard key={a.id} article={a} layout={compact ? "compact" : "standard"} {...card(a.id)} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="collections-heading">
        <div className="section-head">
          <h2 id="collections-heading" className={compact ? "overline muted" : "type-heading-3"}>
            From your collections
          </h2>
          <TextLink to="/collections" tone="muted">
            All collections
          </TextLink>
        </div>
        <div className="card-grid card-grid--fit">
          {state.collections.slice(0, 3).map((c) => (
            <CollectionCard key={c.id} collection={c} progressLabel={collectionProgress(c, getArticle, getState)} />
          ))}
        </div>
      </section>
    </Page>
  );
}
