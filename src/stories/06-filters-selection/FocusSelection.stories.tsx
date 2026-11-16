import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DurationOption, SelectableItem, SessionContentSelection, SessionDurationSelector } from "../../components/focus/Session";
import { Matrix, noop, penpot, sample, Stack } from "../helpers";

const DURATIONS = [
  { minutes: 10, hint: "One short essay" },
  { minutes: 20, hint: "Two pieces, unhurried" },
  { minutes: 30, hint: "A long read, start to finish" },
];
const pool = [sample.gardens, sample["take-notes"], sample["fewer-tabs"], sample["doing-less"]];

/** Focus session setup: how long, and what to read. */
const meta: Meta = { title: "06 · Filters & Selection/Focus session setup" };
export default meta;

export const Duration: StoryObj = {
  name: "DurationOption · Minutes × Selected",
  parameters: penpot("DurationOption"),
  render: () => <Matrix columns={["10", "20", "30"]} rows={["False", "True"]} render={(sel, m) => <DurationOption minutes={Number(m)} hint={DURATIONS.find((d) => d.minutes === Number(m))!.hint} selected={sel === "True"} onSelect={noop} />} />,
};

export const DurationSelector: StoryObj = {
  name: "SessionDurationSelector",
  parameters: penpot("SessionDurationSelector"),
  render: function Render() {
    const [m, setM] = useState(20);
    return <SessionDurationSelector options={DURATIONS} value={m} onChange={setM} />;
  },
};

export const Item: StoryObj = {
  name: "SelectableItem · Selected",
  parameters: penpot("SelectableItem"),
  render: () => (
    <Stack
      width={520}
      items={[
        ["True", <SelectableItem article={sample.gardens} selected onChange={noop} />],
        ["False", <SelectableItem article={sample["take-notes"]} selected={false} onChange={noop} />],
      ]}
    />
  ),
};

export const ContentSelection: StoryObj = {
  name: "SessionContentSelection",
  parameters: penpot("SessionContentSelection"),
  render: function Render() {
    const [sel, setSel] = useState([pool[0].id]);
    return <div style={{ width: 560 }}><SessionContentSelection minutes={20} source="Better Attention" articles={pool} selected={sel} onChange={setSel} /></div>;
  },
};
