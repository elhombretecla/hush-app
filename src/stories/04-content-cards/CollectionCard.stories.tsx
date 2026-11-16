import type { Meta, StoryObj } from "@storybook/react";
import { CollectionCard } from "../../components/content/CollectionCard";
import { collections, Matrix, penpot, pseudoStates, stateClass } from "../helpers";

const meta: Meta<typeof CollectionCard> = {
  title: "04 · Content Cards/CollectionCard",
  component: CollectionCard,
  parameters: penpot("CollectionCard"),
  args: { collection: collections[0], progressLabel: "3 of 5 read" },
};
export default meta;

export const Default: StoryObj<typeof CollectionCard> = { render: (args) => <div style={{ width: 360 }}><CollectionCard {...args} /></div> };

export const States: StoryObj = {
  name: "State: Default · Hover",
  parameters: pseudoStates,
  render: () => (
    <Matrix
      columns={["Default", "Hover"]}
      rows={["Card"]}
      render={(_, s) => (
        <div className={stateClass[s]} style={{ width: 340 }}>
          <CollectionCard collection={collections[1]} progressLabel="1 of 4 read" />
        </div>
      )}
    />
  ),
};
