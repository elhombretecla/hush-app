import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "../../components/actions/IconButton";
import { ICON_NAMES } from "../../components/brand/Icon";
import { Matrix, penpot, pseudoStates, stateClass } from "../helpers";

const meta: Meta<typeof IconButton> = {
  title: "01 · Buttons & Actions/IconButton",
  component: IconButton,
  parameters: penpot("IconButton"),
  argTypes: { variant: { control: "inline-radio", options: ["ghost", "outline", "filled"] }, icon: { control: "select", options: ICON_NAMES } },
  args: { icon: "share", label: "Share", variant: "ghost", pressed: false, disabled: false },
};
export default meta;

export const Playground: StoryObj<typeof IconButton> = {};

export const StyleByState: StoryObj = {
  name: "Style × State",
  parameters: pseudoStates,
  render: () => (
    <Matrix
      columns={["Default", "Hover", "Disabled"]}
      rows={["Ghost", "Outline", "Filled"]}
      render={(style, state) => (
        <span className={stateClass[state]}>
          <IconButton icon="more" label={`${style} ${state}`} variant={style.toLowerCase() as "ghost"} disabled={state === "Disabled"} />
        </span>
      )}
    />
  ),
};
