import { useEffect, useState } from "react";
import { useStore } from "../../app/store";
import { Button } from "../../components/actions/Button";
import { TextButton } from "../../components/actions/TextLink";
import { CollectionOption } from "../../components/content/CollectionOption";
import { Modal } from "../../components/feedback/Modal";
import { useToast } from "../../components/feedback/Toast";
import { SearchInput } from "../../components/forms/SearchInput";
import { TextInput } from "../../components/forms/TextInput";
import "./collections.css";

/** Penpot Modal "Add to collection" — SearchInput + CollectionOption rows + New collection. */
export function AddToCollectionDialog({ articleIds, open, onClose, onDone }: { articleIds: string[]; open: boolean; onClose: () => void; onDone?: (collectionId?: string) => void }) {
  const { state, getArticle, setCollectionMembership, createCollection } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCreating(false);
    setNewName("");
    setPicked(Object.fromEntries(state.collections.map((c) => [c.id, articleIds.length > 0 && articleIds.every((id) => c.articleIds.includes(id))])));
  }, [open]);

  const subtitle = articleIds.length === 1 ? getArticle(articleIds[0])?.title : `${articleIds.length} pieces`;
  const list = state.collections.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  const done = () => {
    let firstAdded: string | undefined;
    for (const c of state.collections) {
      const want = !!picked[c.id];
      const had = articleIds.every((id) => c.articleIds.includes(id));
      if (want !== had) for (const id of articleIds) setCollectionMembership(c.id, id, want);
      if (want && !had && !firstAdded) firstAdded = c.id;
    }
    if (firstAdded) toast({ tone: "success", message: `Saved to ${state.collections.find((c) => c.id === firstAdded)?.name}` });
    onDone?.(firstAdded);
    onClose();
  };

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    createCollection({ id, name, description: "A new collection.", accent: "honey", covers: ["Paper", "Honey", "Clay"], articleIds: [], updatedLabel: "created just now" });
    setPicked((p) => ({ ...p, [id]: true }));
    setCreating(false);
    setNewName("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to collection"
      subtitle={subtitle}
      footer={
        <>
          <Button intent="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button intent="primary" onClick={done}>
            Done
          </Button>
        </>
      }
    >
      <SearchInput value={query} onChange={setQuery} label="Find a collection" placeholder="Find a collection" />
      <div className="collection-options">
        {list.map((c) => (
          <CollectionOption key={c.id} collection={c} selected={!!picked[c.id]} onChange={(v) => setPicked((p) => ({ ...p, [c.id]: v }))} />
        ))}
      </div>
      {creating ? (
        <form
          className="collection-new"
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
        >
          <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name your collection" aria-label="New collection name" data-autofocus />
          <Button type="submit" intent="secondary" disabled={!newName.trim()}>
            Create
          </Button>
        </form>
      ) : (
        <TextButton onClick={() => setCreating(true)} className="collection-new__trigger">
          + New collection
        </TextButton>
      )}
    </Modal>
  );
}
