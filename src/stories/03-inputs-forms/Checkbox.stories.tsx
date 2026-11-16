import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "../../components/forms/Checkbox";
import { Matrix, noop, penpot } from "../helpers";

const meta: Meta<typeof Checkbox> = { title: "03 · Inputs & Forms/Checkbox", component: Checkbox, parameters: penpot("Checkbox") };
export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [on, setOn] = useState(true);
    return <Checkbox checked={on} onChange={setOn} label="Keep highlights when re-reading" />;
  },
};

export const CheckedByState: StoryObj = {
  name: "Checked × State",
  render: () => <Matrix columns={["Default", "Disabled"]} rows={["True", "False"]} render={(c, s) => <Checkbox checked={c === "True"} disabled={s === "Disabled"} onChange={noop} label={`${c} · ${s}`} />} />,
};
