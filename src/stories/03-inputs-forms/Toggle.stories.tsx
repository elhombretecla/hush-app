import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toggle } from "../../components/forms/Toggle";
import { penpot } from "../helpers";

const meta: Meta<typeof Toggle> = { title: "03 · Inputs & Forms/Toggle", component: Toggle, parameters: penpot("Toggle") };
export default meta;

export const Interactive: StoryObj = {
  name: "On: True · False",
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <div style={{ width: 420 }}>
        <Toggle on={on} onChange={setOn} label="Do not disturb during sessions" description="Hide notifications and badges until the session ends." />
      </div>
    );
  },
};
