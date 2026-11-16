import type { Meta, StoryObj } from "@storybook/react";
import { ThemeOption, ThemeSwitcher } from "../../components/navigation/ThemeSwitcher";
import { Matrix, noop, penpot } from "../helpers";

const meta: Meta<typeof ThemeSwitcher> = {
  title: "02 · Navigation/ThemeSwitcher",
  component: ThemeSwitcher,
  parameters: penpot("ThemeSwitcher"),
};
export default meta;

/** Switches the real app theme — the Storybook "Theme" toolbar follows the same store. */
export const Default: StoryObj<typeof ThemeSwitcher> = {};

export const Options: StoryObj = {
  name: "ThemeOption · Theme × Selected",
  parameters: penpot("ThemeOption"),
  render: () => (
    <Matrix
      columns={["Paper", "Night", "Sepia"]}
      rows={["Selected", "Not selected"]}
      render={(row, theme) => <ThemeOption theme={theme.toLowerCase() as "paper"} label={theme} selected={row === "Selected"} onSelect={noop} />}
    />
  ),
};
