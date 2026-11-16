import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "../../components/actions/SegmentedControl";
import { TextButton } from "../../components/actions/TextLink";
import { ContentFilter } from "../../components/content/ContentFilter";
import { FilterBar } from "../../components/content/FilterBar";
import { penpot, Stack } from "../helpers";

const TYPES = ["All", "Article", "Newsletter", "Video", "Audio"] as const;
const meta: Meta<typeof ContentFilter> = { title: "06 · Filters & Selection/ContentFilter", component: ContentFilter, parameters: penpot("ContentFilter") };
export default meta;

/** State: Default (All) · Active (a value picked) · Open (click it). */
export const States: StoryObj = {
  name: "State: Default · Active · Open",
  render: function Render() {
    const [a, setA] = useState<(typeof TYPES)[number]>("All");
    const [b, setB] = useState<(typeof TYPES)[number]>("Newsletter");
    return (
      <div style={{ minHeight: 280 }}>
        <Stack
          items={[
            ["Default", <ContentFilter label="Type" options={TYPES} value={a} onChange={setA} />],
            ["Active", <ContentFilter label="Type" options={TYPES} value={b} onChange={setB} />],
          ]}
        />
      </div>
    );
  },
};

export const Bar: StoryObj = {
  name: "FilterBar",
  parameters: penpot("FilterBar"),
  render: function Render() {
    const [type, setType] = useState<(typeof TYPES)[number]>("All");
    const [view, setView] = useState<"List" | "Grid">("Grid");
    return (
      <div style={{ minHeight: 280 }}>
        <FilterBar
          filters={
            <>
              <ContentFilter label="Type" options={TYPES} value={type} onChange={setType} />
              <ContentFilter label="Status" options={["Any", "Unread", "In progress", "Completed"] as const} value="Any" onChange={() => {}} />
              {type !== "All" && <TextButton tone="muted" onClick={() => setType("All")}>Clear</TextButton>}
            </>
          }
          view={
            <>
              <ContentFilter label="Sort" options={["Recently saved", "Shortest first"] as const} value="Recently saved" onChange={() => {}} />
              <SegmentedControl label="View" options={["List", "Grid"] as const} value={view} onChange={setView} />
            </>
          }
        />
      </div>
    );
  },
};
