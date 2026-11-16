import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../../components/navigation/Breadcrumb";
import { penpot } from "../helpers";

const meta: Meta<typeof Breadcrumb> = {
  title: "02 · Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: penpot("Breadcrumb"),
  args: { items: [{ label: "Collections", to: "/collections" }, { label: "Better Attention" }] },
};
export default meta;
export const Default: StoryObj<typeof Breadcrumb> = {};
