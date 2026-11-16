import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tab, Tabs } from "../../components/navigation/Tabs";
import { noop, penpot } from "../helpers";

const meta: Meta<typeof Tabs> = { title: "02 · Navigation/Tabs", component: Tabs, parameters: penpot("Tabs") };
export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [v, setV] = useState("all");
    return (
      <Tabs
        label="Results"
        value={v}
        onChange={setV}
        tabs={[
          { value: "all", label: "All · 12" },
          { value: "pieces", label: "Pieces · 8" },
          { value: "highlights", label: "Highlights · 4" },
        ]}
      />
    );
  },
};

export const TabStates: StoryObj = {
  name: "Tab · State: Active · Inactive",
  parameters: penpot("Tab"),
  render: () => (
    <div className="tabs" role="tablist" aria-label="Tab states">
      <Tab active label="Active" onClick={noop} />
      <Tab active={false} label="Inactive" onClick={noop} />
    </div>
  ),
};
