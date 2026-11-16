import { useState } from "react";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { ButtonLink } from "../components/actions/Button";
import { SegmentedControl } from "../components/actions/SegmentedControl";
import { Icon } from "../components/brand/Icon";
import { ContentListItem } from "../components/content/ContentListItem";
import { EmptyState } from "../components/feedback/EmptyState";
import { useToast } from "../components/feedback/Toast";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { AddToCollectionDialog } from "../features/collections/AddToCollectionDialog";
import { useIsCompact } from "../hooks/useMediaQuery";
import { savedAgo } from "../utils/format";
import "./pages.css";

const FILTERS = ["All", "Unread", "Started"] as const;

export function InboxPage() {
  const { allArticles, getState, archive, markFinished, fileFromInbox } = useStore();
  const compact = useIsCompact();
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [collectFor, setCollectFor] = useState<string[] | null>(null);

  const inbox = allArticles.filter((a) => getState(a.id).inInbox).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const counts = { All: inbox.length, Unread: inbox.filter((a) => getState(a.id).status === "Unread").length, Started: inbox.filter((a) => getState(a.id).status === "In progress").length };
  const shown = inbox.filter((a) => filter === "All" || (filter === "Unread" ? getState(a.id).status === "Unread" : getState(a.id).status === "In progress"));
  const today = shown.filter((a) => a.savedAt >= "2026-11-15");
  const earlier = shown.filter((a) => a.savedAt < "2026-11-15");

  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
  const archiveIds = (ids: string[]) => {
    ids.forEach(archive);
    setSelected([]);
    toast({ tone: "neutral", message: ids.length === 1 ? "Moved to archive" : `${ids.length} pieces archived`, action: { label: "Undo", onClick: () => ids.forEach((id) => fileFromInbox(id)) } });
  };

  const group = (label: string, items: typeof shown) =>
    items.length > 0 && (
      <section className="inbox-group" aria-label={label}>
        <div className="inbox-group__head">
          <span className="overline muted">{label}</span>
          <span className="type-caption muted">{items.length} items</span>
        </div>
        {items.map((a) => (
          <ContentListItem
            key={a.id}
            article={a}
            meta={`${a.author} · ${a.publication}${a.type !== "Article" ? ` · ${a.type.toLowerCase()}` : ""} · ${savedAgo(a.savedAt)}`}
            selected={selected.includes(a.id)}
            onSelect={(on) => toggle(a.id, on)}
            onAddToCollection={() => setCollectFor([a.id])}
            onArchive={() => archiveIds([a.id])}
          />
        ))}
      </section>
    );

  return (
    <Page title="Inbox" eyebrow={`${inbox.length} new · nothing urgent`} mobileBar={<MobileTopBar type="title" title={`Inbox · ${inbox.length}`} back="/" />} className="inbox">
      <div className="page-title-row">
        <div className="page-titles">
          {!compact && <p className="overline eyebrow">Waiting to be sorted</p>}
          {!compact && <h2 className="type-display-l">Inbox</h2>}
          <p className="type-body-lg lede">Things you saved recently. Keep, file, or let go — there’s no rush.</p>
        </div>
        <SegmentedControl label="Show" options={FILTERS} value={filter} onChange={setFilter} renderLabel={(o) => `${o} ${counts[o]}`} fullWidth={compact} />
      </div>

      {shown.length === 0 ? (
        <EmptyState kind="inbox-zero" title="Nothing waiting." description="Everything you saved has found a place. Enjoy the quiet." action={<ButtonLink to="/library" intent="secondary">Browse your library</ButtonLink>} />
      ) : (
        <div className="inbox-list">
          {group("Today", today)}
          {group("Earlier this week", earlier)}
        </div>
      )}

      {selected.length > 0 && (
        <div className="bulk-bar" role="toolbar" aria-label="Selected items">
          <span className="type-label-sm bulk-bar__count">{selected.length} selected</span>
          <button type="button" className="bulk-bar__action" onClick={() => setCollectFor(selected)}>
            <Icon name="collection" />
            Add to collection
          </button>
          <button
            type="button"
            className="bulk-bar__action"
            onClick={() => {
              selected.forEach(markFinished);
              toast({ tone: "success", message: `${selected.length === 1 ? "Marked" : `${selected.length} marked`} as read` });
              setSelected([]);
            }}
          >
            <Icon name="check" />
            Mark read
          </button>
          <button type="button" className="bulk-bar__action" onClick={() => archiveIds(selected)}>
            <Icon name="archive" />
            Archive
          </button>
          <button type="button" className="bulk-bar__close" aria-label="Clear selection" onClick={() => setSelected([])}>
            <Icon name="close" />
          </button>
        </div>
      )}

      <AddToCollectionDialog
        open={!!collectFor}
        articleIds={collectFor ?? []}
        onClose={() => setCollectFor(null)}
        onDone={(cid) => {
          if (cid) (collectFor ?? []).forEach(fileFromInbox);
          setSelected([]);
        }}
      />
    </Page>
  );
}
