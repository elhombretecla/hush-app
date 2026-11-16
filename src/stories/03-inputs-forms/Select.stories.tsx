import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select } from "../../components/forms/Select";
import { penpot } from "../helpers";

const meta: Meta<typeof Select> = { title: "03 · Inputs & Forms/Select", component: Select, parameters: penpot("Select") };
export default meta;

/** State: Default · Open — click to open; arrow keys move, Enter selects. */
export const Interactive: StoryObj = {
  render: function Render() {
    const [v, setV] = useState("better-attention");
    return (
      <div style={{ width: 320, minHeight: 260 }}>
        <Select
          label="Add to collection"
          value={v}
          onChange={setV}
          options={[
            { value: "better-attention", label: "Better Attention" },
            { value: "everyday-life", label: "The Shape of Everyday Life" },
            { value: "quieter-web", label: "Designing a Quieter Web" },
          ]}
        />
      </div>
    );
  },
};
