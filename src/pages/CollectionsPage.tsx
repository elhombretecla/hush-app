import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { IconButton } from "../components/actions/IconButton";
import { CollectionCard } from "../components/content/CollectionCard";
import { Modal } from "../components/feedback/Modal";
import { useToast } from "../components/feedback/Toast";
import { FormField, TextInput } from "../components/forms/TextInput";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { useIsCompact } from "../hooks/useMediaQuery";
import { collectionProgress } from "../utils/format";
import "./pages.css";

const SUGGESTED = ["public-library", "library-listens", "margin-31", "moments-between", "small-rituals"];

export function CollectionsPage() {
  const { state, getArticle, getState, createCollection } = useStore();
  const compact = useIsCompact();
  const navigate = useNavigate();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const hasSuggestion = !state.collections.some((c) => c.id === "shared-quiet");
  const total = new Set(state.collections.flatMap((c) => c.articleIds)).size;

  const create = (id: string, n: string, d: string, articleIds: string[] = []) => {
    createCollection({ id, name: n, description: d, accent: "honey", covers: ["Paper", "Clay", "Honey"], articleIds, updatedLabel: "created just now" });
    toast({ tone: "success", message: `Created ${n}` });
    navigate(`/collections/${id}`);
  };

  return (
    <Page
      title="Collections"
      eyebrow={`${state.collections.length} collections · ${total} pieces`}
      mobileBar={<MobileTopBar type="title" title="Collections" back="/" actions={<IconButton icon="plus" label="New collection" onClick={() => setCreating(true)} />} />}
    >
      <div className="page-title-row">
        <div className="page-titles">
          {!compact && <p className="overline eyebrow">Themes you keep coming back to</p>}
          {!compact && <h2 className="type-display-l">Collections</h2>}
          <p className="type-body-lg lede">Small shelves for ideas that belong together. Add anything — an essay, an episode, a single highlight.</p>
        </div>
        {!compact && (
          <Button intent="secondary" icon="plus" onClick={() => setCreating(true)}>
            New collection
          </Button>
        )}
      </div>

      <div className="card-grid card-grid--3">
        {state.collections.map((c) => (
          <CollectionCard key={c.id} collection={c} progressLabel={collectionProgress(c, getArticle, getState)} />
        ))}
      </div>

      {hasSuggestion && (
        <aside className="suggestion" aria-label="Suggested collection">
          <div>
            <p className="type-label-md">Five pieces about libraries and public space are scattered across your library.</p>
            <p className="type-body-sm muted-2">Gather them into a new collection called “Shared Quiet”?</p>
          </div>
          <Button intent="ghost" onClick={() => create("shared-quiet", "Shared Quiet", "Libraries, reading rooms and the public spaces where attention is held in common.", SUGGESTED)}>
            Create “Shared Quiet”
          </Button>
        </aside>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New collection"
        footer={
          <>
            <Button intent="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              intent="primary"
              disabled={!name.trim()}
              onClick={() => {
                setCreating(false);
                create(name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36), name.trim(), description.trim() || "A new collection.");
                setName("");
                setDescription("");
              }}
            >
              Create collection
            </Button>
          </>
        }
      >
        <FormField label="Name" htmlFor="collection-name" hint="Required">
          <TextInput id="collection-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Give it a title" data-autofocus />
        </FormField>
        <FormField label="Description" htmlFor="collection-desc" helper="One line about what belongs here.">
          <TextInput id="collection-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Essays about…" />
        </FormField>
      </Modal>
    </Page>
  );
}
