import type { Meta, StoryObj } from "@storybook/react";
import { BackButton } from "../../components/navigation/BackButton";
import { penpot } from "../helpers";

const meta: Meta<typeof BackButton> = {
  title: "02 · Navigation/BackButton",
  component: BackButton,
  parameters: penpot("BackButton"),
  args: { to: "/library", label: "Library" },
};
export default meta;
export const Default: StoryObj<typeof BackButton> = {};
