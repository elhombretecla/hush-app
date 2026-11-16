import type { Meta, StoryObj } from "@storybook/react";
import { FormError, FormField, TextInput } from "../../components/forms/TextInput";
import { penpot, Stack } from "../helpers";

const meta: Meta<typeof FormField> = { title: "03 · Inputs & Forms/FormField", component: FormField, parameters: penpot("FormField") };
export default meta;

export const States: StoryObj = {
  name: "State: Default · Error",
  render: () => (
    <Stack
      width={420}
      items={[
        [
          "Default",
          <FormField label="Collection name" hint="Optional" helper="Short and specific works best." htmlFor="ff-1">
            <TextInput id="ff-1" defaultValue="Better Attention" />
          </FormField>,
        ],
        [
          "Error",
          <FormField label="Link" htmlFor="ff-2" error="That link doesn’t look complete — check for a missing .com">
            <TextInput id="ff-2" icon="link" status="error" defaultValue="https://elsewherejournal" />
          </FormField>,
        ],
      ]}
    />
  ),
};

export const Error: StoryObj = { name: "FormError", parameters: penpot("FormError"), render: () => <FormError message="Couldn’t reach that page. Check the link, or save it anyway." /> };
