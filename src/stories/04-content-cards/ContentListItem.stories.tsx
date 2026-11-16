import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ContentListItem } from "../../components/content/ContentListItem";
import { noop, penpot, pseudoStates, sample, Stack } from "../helpers";

const meta: Meta<typeof ContentListItem> = { title: "04 · Content Cards/ContentListItem", component: ContentListItem, parameters: penpot("ContentListItem") };
export default meta;

const props = { article: sample.gardens, meta: "Anika Paul · Elsewhere Journal · saved yesterday", onAddToCollection: noop, onArchive: noop };

export const Interactive: StoryObj = {
  render: function Render() {
    const [sel, setSel] = useState(false);
    return <div style={{ maxWidth: 1000 }}><ContentListItem {...props} selected={sel} onSelect={setSel} /></div>;
  },
};

export const States: StoryObj = {
  name: "State: Default · Hover · Selected",
  parameters: pseudoStates,
  render: () => (
    <Stack
      width={1000}
      items={[
        ["Default", <ContentListItem {...props} selected={false} onSelect={noop} />],
        ["Hover", <div className="is-sb-hover"><ContentListItem {...props} selected={false} onSelect={noop} /></div>],
        ["Selected", <ContentListItem {...props} selected onSelect={noop} />],
      ]}
    />
  ),
};
