import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "../../components/actions/IconButton";
import { MobileTopBar } from "../../components/navigation/MobileTopBar";
import { penpot, Stack } from "../helpers";

const meta: Meta<typeof MobileTopBar> = {
  title: "02 · Navigation/MobileTopBar",
  component: MobileTopBar,
  parameters: { ...penpot("MobileTopBar"), viewport: { defaultViewport: "mobile" } },
  argTypes: { type: { control: "inline-radio", options: ["brand", "title", "reader"] } },
  args: { type: "title", title: "Inbox · 9", back: "/" },
};
export default meta;

export const Playground: StoryObj<typeof MobileTopBar> = {};

export const Types: StoryObj = {
  name: "Type: Brand · Title · Reader",
  render: () => (
    <Stack
      width={358}
      items={[
        ["Brand", <MobileTopBar type="brand" />],
        ["Title", <MobileTopBar type="title" title="Inbox · 9" back="/" />],
        ["Reader", <MobileTopBar type="reader" title="Elsewhere Journal" back="/library" actions={<IconButton icon="type" label="Reading preferences" />} />],
      ]}
    />
  ),
};
