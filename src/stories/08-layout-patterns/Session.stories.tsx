import type { Meta, StoryObj } from "@storybook/react";
import { SessionCompletion, SessionControls, SessionProgress, SessionTimer } from "../../components/focus/Session";
import { noop, penpot } from "../helpers";

/** Pieces of the active focus session. */
const meta: Meta = { title: "08 · Layout Patterns/Focus session" };
export default meta;

export const Timer: StoryObj<typeof SessionTimer> = {
  name: "SessionTimer",
  parameters: penpot("SessionTimer"),
  argTypes: { remainingMs: { control: { type: "range", min: 0, max: 1_800_000, step: 1000 } } },
  args: { remainingMs: 754_000, minutes: 20, paused: false },
  render: (args) => <div style={{ textAlign: "center" }}><SessionTimer {...args} /></div>,
};

export const Progress: StoryObj<typeof SessionProgress> = {
  name: "SessionProgress",
  parameters: penpot("SessionProgress"),
  argTypes: { fraction: { control: { type: "range", min: 0, max: 1, step: 0.01 } } },
  args: { count: 3, index: 1, fraction: 0.45, label: "2 of 3 · Notebook Review" },
  render: (args) => <SessionProgress {...args} />,
};

export const Controls: StoryObj<typeof SessionControls> = {
  name: "SessionControls",
  parameters: penpot("SessionControls"),
  args: { paused: false, canNext: true, onEnd: noop, onTogglePause: noop, onNext: noop },
  render: (args) => <SessionControls {...args} />,
};

export const Completion: StoryObj<typeof SessionCompletion> = {
  name: "SessionCompletion",
  parameters: penpot("SessionCompletion"),
  args: { title: "Twenty quiet minutes.", summary: "You read 2 pieces and kept 1 highlight. That’s enough for today.", pieces: 2, minutes: 20, highlights: 1, onReview: noop, onHome: noop },
  render: (args) => <SessionCompletion {...args} />,
};
