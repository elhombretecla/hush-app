import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../components/actions/Button";
import { Annotation } from "../../components/reading/Annotation";
import { HighlightActionBar } from "../../components/reading/HighlightActionBar";
import { ReaderFooter } from "../../components/reading/ReaderFooter";
import { ReadingCompletion } from "../../components/reading/ReadingCompletion";
import { ReadingPreferences } from "../../components/reading/ReadingPreferences";
import { TableOfContents } from "../../components/reading/TableOfContents";
import { highlight, noop, penpot, sample } from "../helpers";

/** Reader surfaces around the text. */
const meta: Meta = { title: "05 · Reading Components/Reader panels" };
export default meta;

export const ActionBar: StoryObj = {
  name: "HighlightActionBar",
  parameters: penpot("HighlightActionBar"),
  render: () => (
    <div style={{ position: "relative", height: 120 }}>
      <HighlightActionBar top={70} left={200} onHighlight={noop} onNote={noop} onCopy={noop} />
    </div>
  ),
};

export const AnnotationCard: StoryObj = {
  name: "Annotation",
  parameters: penpot("Annotation"),
  render: () => <Annotation highlight={highlight} onSave={noop} onDelete={noop} onClose={noop} style={{ position: "static", width: 320 }} />,
};

export const Contents: StoryObj = {
  name: "TableOfContents",
  parameters: penpot("TableOfContents"),
  render: function Render() {
    const items = sample["long-way-home"].body.filter((b) => b.type === "subheading").map((b) => ({ id: b.id, label: b.text }));
    const [active, setActive] = useState(items[0]?.id ?? null);
    return <div style={{ width: 240 }}><TableOfContents items={items.length ? items : [{ id: "a", label: "Tending, not posting" }, { id: "b", label: "What gardens ask of us" }]} active={active} onSelect={setActive} /></div>;
  },
};

export const Preferences: StoryObj = {
  name: "ReadingPreferences",
  parameters: penpot("ReadingPreferences"),
  render: () => <div style={{ width: 360 }}><ReadingPreferences onClose={noop} /></div>,
};

export const Footer: StoryObj = {
  name: "ReaderFooter",
  parameters: penpot("ReaderFooter"),
  render: () => <div style={{ maxWidth: 680 }}><ReaderFooter article={sample.gardens} finished={false} onFinish={noop} onCollect={noop} onDelete={noop} /></div>,
};

export const Completion: StoryObj = {
  name: "ReadingCompletion",
  parameters: penpot("ReadingCompletion"),
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <ReadingCompletion minutes={10} highlights={2} notes={1} collectionName="Better Attention" actions={<Button intent="secondary">Back to library</Button>} />
    </div>
  ),
};
