import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button, ButtonLink } from "../components/actions/Button";
import { IconButton } from "../components/actions/IconButton";
import { ArticleCard } from "../components/content/ArticleCard";
import { ContentCover } from "../components/content/ContentCover";
import { EmptyState } from "../components/feedback/EmptyState";
import { Modal } from "../components/feedback/Modal";
import { useToast } from "../components/feedback/Toast";
import { Checkbox } from "../components/forms/Checkbox";
import { Breadcrumb } from "../components/navigation/Breadcrumb";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { Tabs } from "../components/navigation/Tabs";
import { useIsCompact } from "../hooks/useMediaQuery";
import { collectionProgress } from "../utils/format";
import "./pages.css";

type Filter = "all" | "In progress" | "Unread" | "Completed";

export function CollectionDetailPage() {
  const { id = "" } = useParams();
  const { state, allArticles, getArticle, getState, toggleBookmark, setCollectionMembership } = useStore();
  const compact = useIsCompact();
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const collection = state.collections.find((c) => c.id === id);

  if (!collection) {
    return (
      <Page title="Collection" mobileBar={<MobileTopBar type="title" title="Collection" back="/collections" />}>
        <EmptyState kind="no-results" title="This collection doesn’t exist" description="It may have been removed." action={<ButtonLink to="/collections" intent="secondary">All collections</ButtonLink>} />
      </Page>
    );
  }

  const pieces = collection.articleIds.map(getArticle).filter((a): a is NonNullable<typeof a> => !!a);
  const count = (f: Filter) => pieces.filter((a) => f === "all" || getState(a.id).status === f).length;
  const shown = pieces.filter((a) => filter === "all" || getState(a.id).status === filter);
  const candidates = allArticles.filter((a) => !collection.articleIds.includes(a.id) && !getState(a.id).archived);

  const remove = (articleId: string, title: string) => {
    setCollectionMembership(collection.id, articleId, false);
    toast({ tone: "neutral", message: `Removed “${title}”`, action: { label: "Undo", onClick: () => setCollectionMembership(collection.id, articleId, true) } });
  };

  return (
    <Page title={collection.name} eyebrow="Collections" mobileBar={<MobileTopBar type="title" title="Collection" back="/collections" />} className="collection-detail">
      {!compact && <Breadcrumb items={[{ label: "Collections", to: "/collections" }, { label: collection.name }]} />}
      <section className="collection-hero">
        <div className="collection-hero__covers" aria-hidden="true">
          {collection.covers.map((t, i) => (
            <ContentCover key={i} tone={t} className={`collection-hero__cover collection-hero__cover--${i + 1}`} />
          ))}
        </div>
        <div className="collection-hero__text">
          <p className="overline muted">
            {pieces.length} pieces · {collectionProgress(collection, getArticle, getState)} · {collection.updatedLabel}
          </p>
          <h2 className="type-display-l">{collection.name}</h2>
          <p className="type-body-lg muted-2">{collection.description}</p>
          <div className="collection-hero__actions">
            <Button intent="primary" fullWidth={compact} onClick={() => navigate(`/focus?collection=${collection.id}`)} disabled={!pieces.length}>
              Start a 20-minute session
            </Button>
            {!compact && (
              <Button intent="secondary" icon="plus" onClick={() => setAdding(true)}>
                Add pieces
              </Button>
            )}
            {!compact && <IconButton icon="share" label="Copy link to this collection" variant="outline" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast({ tone: "success", message: "Link copied" }))} />}
          </div>
        </div>
      </section>

      {pieces.length === 0 ? (
        <div className="empty-panel">
          <EmptyState kind="empty-collection" title="This collection is ready for its first piece." description={`Add pieces about ${collection.description.toLowerCase().replace(/\.$/, "")}.`} action={<Button intent="secondary" onClick={() => setAdding(true)}>Add from library</Button>} />
        </div>
      ) : (
        <>
          <Tabs<Filter>
            label="Filter pieces"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: `All ${count("all")}` },
              { value: "In progress", label: `In progress ${count("In progress")}` },
              { value: "Unread", label: `Unread ${count("Unread")}` },
              { value: "Completed", label: `Finished ${count("Completed")}` },
            ]}
          />
          <div className="collection-pieces">
            {shown.map((a) => (
              <div key={a.id} className="collection-piece">
                <ArticleCard article={a} layout="compact" state={getState(a.id)} onBookmark={() => toggleBookmark(a.id, getState(a.id).bookmarked)} />
                <IconButton icon="minus" label={`Remove “${a.title}” from ${collection.name}`} className="collection-piece__remove" onClick={() => remove(a.id, a.title)} />
              </div>
            ))}
          </div>
          {compact && (
            <Button intent="secondary" icon="plus" onClick={() => setAdding(true)}>
              Add pieces
            </Button>
          )}
        </>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add pieces"
        subtitle={collection.name}
        footer={
          <>
            <Button intent="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              intent="primary"
              disabled={!picked.length}
              onClick={() => {
                picked.forEach((aid) => setCollectionMembership(collection.id, aid, true));
                toast({ tone: "success", message: `Added ${picked.length} ${picked.length === 1 ? "piece" : "pieces"}` });
                setPicked([]);
                setAdding(false);
              }}
            >
              Add {picked.length || ""}
            </Button>
          </>
        }
      >
        <div className="pick-list">
          {candidates.map((a) => (
            <label key={a.id} className={`pick-row ${picked.includes(a.id) ? "is-selected" : ""}`}>
              <Checkbox checked={picked.includes(a.id)} onChange={(on) => setPicked((p) => (on ? [...p, a.id] : p.filter((x) => x !== a.id)))} label={a.title} hideLabel />
              <span className="pick-row__text">
                <span className="pick-row__title">{a.title}</span>
                <span className="type-caption muted">
                  {a.author} · {a.publication}
                </span>
              </span>
              <span className="type-label-sm muted">{a.minutes} min</span>
            </label>
          ))}
        </div>
      </Modal>
    </Page>
  );
}
