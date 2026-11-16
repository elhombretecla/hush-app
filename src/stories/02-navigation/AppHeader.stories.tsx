import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "../../components/navigation/AppHeader";
import { noop, penpot } from "../helpers";

const meta: Meta<typeof AppHeader> = {
  title: "02 · Navigation/AppHeader",
  component: AppHeader,
  parameters: { ...penpot("AppHeader"), layout: "fullscreen" },
  args: { title: "Inbox", eyebrow: "9 new · nothing urgent", onSave: noop },
};
export default meta;
export const Default: StoryObj<typeof AppHeader> = {};
