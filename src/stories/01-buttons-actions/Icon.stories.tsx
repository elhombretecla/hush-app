import type { Meta, StoryObj } from "@storybook/react";
import { Icon, ICON_NAMES } from "../../components/brand/Icon";
import { penpot } from "../helpers";

const meta: Meta<typeof Icon> = {
  title: "01 · Buttons & Actions/Icon",
  component: Icon,
  parameters: penpot(...ICON_NAMES.map((n) => `Icon / ${n}`)),
  argTypes: { name: { control: "select", options: ICON_NAMES }, size: { control: { type: "range", min: 12, max: 48 } } },
  args: { name: "bookmark", size: 24 },
};
export default meta;

export const Playground: StoryObj<typeof Icon> = {};

/** The full set — 24×24 grid, 1.75 stroke, same names as the Penpot "Icon / *" components. */
export const AllIcons: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, color: "var(--color-icon-primary)" }}>
      {ICON_NAMES.map((n) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16, border: "1px solid var(--color-border-subtle)", borderRadius: 12, background: "var(--color-bg-surface)" }}>
          <Icon name={n} />
          <span className="type-caption muted">{n}</span>
        </div>
      ))}
    </div>
  ),
};
