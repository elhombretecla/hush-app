import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BookmarkButton } from "../../components/actions/BookmarkButton";
import { Matrix, noop, penpot, pseudoStates, stateClass } from "../helpers";

const meta: Meta<typeof BookmarkButton> = {
  title: "01 · Buttons & Actions/BookmarkButton",
  component: BookmarkButton,
  parameters: penpot("BookmarkButton"),
};
export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [saved, setSaved] = useState(false);
    return <BookmarkButton saved={saved} onToggle={() => setSaved(!saved)} title="The Internet Should Have Gardens" />;
  },
};

export const States: StoryObj = {
  name: "State: Unsaved · Saved · Hover · Disabled",
  parameters: pseudoStates,
  render: () => (
    <Matrix
      columns={["Unsaved", "Saved", "Hover", "Disabled"]}
      rows={["State"]}
      render={(_, s) => (
        <span className={stateClass[s]}>
          <BookmarkButton saved={s === "Saved"} disabled={s === "Disabled"} onToggle={noop} title="A piece" />
        </span>
      )}
    />
  ),
};
