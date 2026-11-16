import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TextArea, TextInput, URLInput } from "../../components/forms/TextInput";
import { penpot, Stack } from "../helpers";

const meta: Meta<typeof TextInput> = {
  title: "03 · Inputs & Forms/TextInput",
  component: TextInput,
  parameters: penpot("TextInput"),
  argTypes: { status: { control: "inline-radio", options: [undefined, "loading", "valid", "error"] } },
  args: { placeholder: "Name this collection", disabled: false },
};
export default meta;

export const Playground: StoryObj<typeof TextInput> = { render: (args) => <div style={{ width: 360 }}><TextInput aria-label="Text input" {...args} /></div> };

const focus = { pseudo: { focusWithin: [".is-sb-focus", ".is-sb-focus *"], focus: [".is-sb-focus input", ".is-sb-focus textarea"], focusVisible: [".is-sb-focus input", ".is-sb-focus textarea"] } };

export const States: StoryObj = {
  name: "State: Default · Focus · Filled · Error · Disabled",
  parameters: focus,
  render: () => (
    <Stack
      width={360}
      items={[
        ["Default", <TextInput aria-label="Default" placeholder="Name this collection" />],
        ["Focus", <span className="is-sb-focus"><TextInput aria-label="Focus" placeholder="Name this collection" /></span>],
        ["Filled", <TextInput aria-label="Filled" defaultValue="Better Attention" />],
        ["Error", <TextInput aria-label="Error" status="error" defaultValue="Better Attention" />],
        ["Disabled", <TextInput aria-label="Disabled" disabled defaultValue="Better Attention" />],
      ]}
    />
  ),
};

export const UrlInput: StoryObj = {
  name: "URLInput · State",
  parameters: { ...penpot("URLInput"), ...focus },
  render: () => (
    <Stack
      width={420}
      items={[
        ["Default", <URLInput aria-label="Default" />],
        ["Focus", <span className="is-sb-focus"><URLInput aria-label="Focus" /></span>],
        ["Loading", <URLInput aria-label="Loading" status="loading" defaultValue="https://elsewherejournal.com/essays/internet-gardens" />],
        ["Valid", <URLInput aria-label="Valid" status="valid" defaultValue="https://elsewherejournal.com/essays/internet-gardens" />],
        ["Error", <URLInput aria-label="Error" status="error" defaultValue="elsewherejournal" />],
      ]}
    />
  ),
};

export const Area: StoryObj = {
  name: "TextArea · State: Default · Focus",
  parameters: { ...penpot("TextArea"), ...focus },
  render: function Render() {
    const [v, setV] = useState("Use for the talk on calm software — slide 4.");
    return (
      <Stack
        width={420}
        items={[
          ["Default", <TextArea aria-label="Note" value={v} onChange={(e) => setV(e.target.value)} />],
          ["Focus", <span className="is-sb-focus" style={{ display: "block" }}><TextArea aria-label="Note (focus)" value="" placeholder="Add a note…" onChange={() => {}} /></span>],
        ]}
      />
    );
  },
};
