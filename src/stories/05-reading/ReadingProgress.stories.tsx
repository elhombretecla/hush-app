import type { Meta, StoryObj } from "@storybook/react";
import { ReadingProgress } from "../../components/reading/ReadingProgress";
import { penpot, Stack } from "../helpers";

const meta: Meta<typeof ReadingProgress> = {
  title: "05 · Reading Components/ReadingProgress",
  component: ReadingProgress,
  parameters: penpot("ReadingProgress"),
  argTypes: { value: { control: { type: "range", min: 0, max: 1, step: 0.01 } } },
  args: { value: 0.38 },
};
export default meta;
export const Playground: StoryObj<typeof ReadingProgress> = { render: (args) => <div style={{ width: 480 }}><ReadingProgress {...args} /></div> };
export const Values: StoryObj = {
  name: "Value: 0 · 38 · 62 · 100",
  render: () => <Stack width={480} items={[0, 0.38, 0.62, 1].map((v) => [`${Math.round(v * 100)}`, <ReadingProgress value={v} />] as [string, JSX.Element])} />,
};
