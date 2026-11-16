import type { Meta, StoryObj } from "@storybook/react";
import { ContentCover } from "../../components/content/ContentCover";
import type { CoverTone } from "../../data/types";
import { penpot } from "../helpers";

const TONES: CoverTone[] = ["Moss", "Clay", "Honey", "Ink", "Paper"];
const meta: Meta<typeof ContentCover> = {
  title: "04 · Content Cards/ContentCover",
  component: ContentCover,
  parameters: penpot("ContentCover"),
  argTypes: { tone: { control: "inline-radio", options: TONES } },
  args: { tone: "Moss" },
};
export default meta;

export const Playground: StoryObj<typeof ContentCover> = { render: (args) => <div style={{ width: 320, height: 200 }}><ContentCover {...args} /></div> };

export const Tones: StoryObj = {
  name: "Tone: Moss · Clay · Honey · Ink · Paper",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 200px)", gap: 16 }}>
      {TONES.map((t) => (
        <div key={t} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 130, borderRadius: 12, overflow: "hidden" }}>
            <ContentCover tone={t} />
          </div>
          <span className="type-caption muted">{t}</span>
        </div>
      ))}
    </div>
  ),
};
