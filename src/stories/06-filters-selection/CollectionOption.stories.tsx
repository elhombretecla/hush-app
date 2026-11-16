import type { Meta, StoryObj } from "@storybook/react";
import { CollectionOption } from "../../components/content/CollectionOption";
import { collections, noop, penpot, Stack } from "../helpers";

const meta: Meta<typeof CollectionOption> = { title: "06 · Filters & Selection/CollectionOption", component: CollectionOption, parameters: penpot("CollectionOption") };
export default meta;

export const States: StoryObj = {
  name: "Selected: True · False",
  render: () => (
    <Stack
      width={420}
      items={[
        ["True", <CollectionOption collection={collections[0]} selected onChange={noop} />],
        ["False", <CollectionOption collection={collections[1]} selected={false} onChange={noop} />],
      ]}
    />
  ),
};
