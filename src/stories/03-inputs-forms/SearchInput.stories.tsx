import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "../../components/forms/SearchInput";
import { noop, penpot, Stack } from "../helpers";

const meta: Meta<typeof SearchInput> = { title: "03 · Inputs & Forms/SearchInput", component: SearchInput, parameters: penpot("SearchInput") };
export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [q, setQ] = useState("");
    return <SearchInput value={q} onChange={setQ} label="Search your library" placeholder="Search your library" shortcut="⌘K" style={{ width: 320 }} />;
  },
};

export const States: StoryObj = {
  name: "State: Default · Focus · Filled",
  parameters: { pseudo: { focusWithin: [".is-sb-focus", ".is-sb-focus *"], focus: [".is-sb-focus input"], focusVisible: [".is-sb-focus input"] } },
  render: () => (
    <Stack
      width={320}
      items={[
        ["Default", <SearchInput value="" onChange={noop} label="Default" placeholder="Search your library" shortcut="⌘K" />],
        ["Focus", <span className="is-sb-focus"><SearchInput value="" onChange={noop} label="Focus" placeholder="Search your library" /></span>],
        ["Filled", <SearchInput value="attention" onChange={noop} label="Filled" />],
      ]}
    />
  ),
};
