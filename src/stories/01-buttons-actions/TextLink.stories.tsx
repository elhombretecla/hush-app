import type { Meta, StoryObj } from "@storybook/react";
import { TextButton, TextLink } from "../../components/actions/TextLink";
import { Matrix, penpot, pseudoStates, stateClass } from "../helpers";

const meta: Meta<typeof TextLink> = {
  title: "01 · Buttons & Actions/TextLink",
  component: TextLink,
  parameters: penpot("TextLink"),
  argTypes: { tone: { control: "inline-radio", options: ["default", "muted"] } },
  args: { to: "/library", children: "See all", tone: "default", arrow: true },
};
export default meta;

export const Playground: StoryObj<typeof TextLink> = {};

export const States: StoryObj = {
  name: "State: Default · Hover · Muted",
  parameters: pseudoStates,
  render: () => (
    <Matrix
      columns={["Default", "Hover", "Muted"]}
      rows={["TextLink"]}
      render={(_, s) => (
        <span className={stateClass[s]}>
          <TextLink to="/library" tone={s === "Muted" ? "muted" : "default"}>
            See all
          </TextLink>
        </span>
      )}
    />
  ),
};

/** Code-side: TextLink styling on a <button> for in-place actions (Clear filters, Paste from clipboard). */
export const AsButton: StoryObj = {
  name: "TextButton (code)",
  parameters: { codeOnly: "TextButton — Penpot TextLink rendered as a <button>" },
  render: () => <TextButton tone="muted">Clear</TextButton>,
};
