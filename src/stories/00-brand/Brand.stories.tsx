import type { Meta, StoryObj } from "@storybook/react";
import { AppIcon, Wordmark } from "../../components/brand/Wordmark";
import { Stack } from "../helpers";

/** Brand marks live in HUSH / Design Foundations (Brand / Wordmark / *, Brand / App Icon). */
const meta: Meta<typeof Wordmark> = {
  title: "Brand/Wordmark",
  component: Wordmark,
  parameters: { penpotBrand: ["Brand / Wordmark / Primary", "Brand / Wordmark / Reversed", "Brand / Wordmark / Compact", "Brand / App Icon"] },
  argTypes: { variant: { control: "inline-radio", options: ["primary", "reversed", "compact"] }, size: { control: { type: "range", min: 24, max: 120 } } },
  args: { variant: "primary", size: 56 },
};
export default meta;

export const Playground: StoryObj<typeof Wordmark> = {};

export const AllMarks: StoryObj = {
  name: "Wordmark / Primary · Reversed · Compact + App Icon",
  render: () => (
    <Stack
      items={[
        ["Primary", <Wordmark size={56} />],
        ["Reversed", <div style={{ background: "var(--color-bg-inverse)", padding: 24, borderRadius: 12, width: "fit-content" }}><Wordmark variant="reversed" size={56} /></div>],
        ["Compact", <Wordmark variant="compact" size={56} />],
        ["App Icon", <AppIcon size={96} />],
      ]}
    />
  ),
};
