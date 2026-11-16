import type { Meta, StoryObj } from "@storybook/react";
import { ReadingToolbar } from "../../components/reading/ReadingToolbar";
import { noop, penpot } from "../helpers";

const meta: Meta<typeof ReadingToolbar> = {
  title: "05 · Reading Components/ReadingToolbar",
  component: ReadingToolbar,
  parameters: penpot("ReadingToolbar"),
  argTypes: { orientation: { control: "inline-radio", options: ["rail", "pill"] } },
  args: { orientation: "rail", bookmarked: false, prefsOpen: false, title: "The Internet Should Have Gardens", onPreferences: noop, onHighlights: noop, onBookmark: noop, onShare: noop },
};
export default meta;
export const Rail: StoryObj<typeof ReadingToolbar> = { render: (args) => <div style={{ position: "relative", height: 260 }}><ReadingToolbar {...args} /></div> };
export const Pill: StoryObj<typeof ReadingToolbar> = { args: { orientation: "pill" }, parameters: { viewport: { defaultViewport: "mobile" } }, render: (args) => <div style={{ position: "relative", height: 200 }}><ReadingToolbar {...args} /></div> };
