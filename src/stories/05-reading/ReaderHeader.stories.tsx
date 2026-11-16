import type { Meta, StoryObj } from "@storybook/react";
import { ReaderHeader } from "../../components/reading/ReaderHeader";
import { noop, penpot } from "../helpers";

const meta: Meta<typeof ReaderHeader> = {
  title: "05 · Reading Components/ReaderHeader",
  component: ReaderHeader,
  parameters: { ...penpot("ReaderHeader"), layout: "fullscreen" },
  argTypes: { progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } } },
  args: { publication: "Elsewhere Journal", title: "The Internet Should Have Gardens", progress: 0.38, timeLeft: "6 min left", bookmarked: false, prefsOpen: false, onBookmark: noop, onPreferences: noop, onHighlights: noop, onCollect: noop, backTo: "/library", backLabel: "Library" },
};
export default meta;
export const Default: StoryObj<typeof ReaderHeader> = {};
