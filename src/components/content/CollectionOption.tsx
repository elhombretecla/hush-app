import type { Collection } from "../../data/types";
import { Checkbox } from "../forms/Checkbox";
import { ContentCover } from "./ContentCover";
import "../../features/collections/collections.css";

/** Penpot CollectionOption — Selected: True · False. A row in the add-to-collection picker. */
export function CollectionOption({ collection, selected, onChange }: { collection: Collection; selected: boolean; onChange: (selected: boolean) => void }) {
  return (
    <label className={`collection-option ${selected ? "is-selected" : ""}`}>
      <span className="collection-option__thumb" aria-hidden="true">
        <ContentCover tone={collection.covers[2]} />
      </span>
      <span className="collection-option__text">
        <span className="type-label-md">{collection.name}</span>
        <span className="type-caption muted">{collection.articleIds.length} pieces</span>
      </span>
      <Checkbox checked={selected} onChange={onChange} label={`Add to ${collection.name}`} hideLabel />
    </label>
  );
}
