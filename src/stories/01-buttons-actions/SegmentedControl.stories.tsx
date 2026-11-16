import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Segment, SegmentedControl } from "../../components/actions/SegmentedControl";
import { penpot, Stack } from "../helpers";

const meta: Meta<typeof SegmentedControl> = {
  title: "01 · Buttons & Actions/SegmentedControl",
  component: SegmentedControl,
  parameters: penpot("SegmentedControl"),
};
export default meta;

export const Options: StoryObj = {
  name: "Options: 3 · 2",
  render: function Render() {
    const [three, setThree] = useState<"All" | "Unread" | "Started">("All");
    const [two, setTwo] = useState<"List" | "Grid">("Grid");
    return (
      <Stack
        items={[
          ["Options = 3", <SegmentedControl label="Show" options={["All", "Unread", "Started"] as const} value={three} onChange={setThree} />],
          ["Options = 2", <SegmentedControl label="View" options={["List", "Grid"] as const} value={two} onChange={setTwo} />],
        ]}
      />
    );
  },
};

export const SegmentStates: StoryObj = {
  name: "Segment · Selected: True · False",
  parameters: penpot("Segment"),
  render: () => (
    <div role="radiogroup" aria-label="Segment" className="segmented" style={{ width: "fit-content" }}>
      <Segment selected>Selected</Segment>
      <Segment selected={false}>Not selected</Segment>
    </div>
  ),
};
