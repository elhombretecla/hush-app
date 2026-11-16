import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonLink, type ButtonIntent, type ButtonSize } from "../../components/actions/Button";
import { ICON_NAMES } from "../../components/brand/Icon";
import { Matrix, penpot, pseudoStates, stateClass } from "../helpers";

const INTENTS: ButtonIntent[] = ["primary", "secondary", "ghost", "destructive"];
const SIZES: Record<string, ButtonSize> = { Small: "sm", Medium: "md", Large: "lg" };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const meta: Meta<typeof Button> = {
  title: "01 · Buttons & Actions/Button",
  component: Button,
  parameters: penpot("Button"),
  argTypes: {
    intent: { control: "inline-radio", options: INTENTS },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    icon: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
  args: { intent: "primary", size: "md", children: "Save something", disabled: false, loading: false, fullWidth: false },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

/** Intent × State, Medium — the Penpot matrix. Hover, Pressed and Focus are forced with the pseudo-states addon. */
export const IntentByState: Story = {
  name: "Intent × State",
  parameters: pseudoStates,
  render: () => (
    <Matrix
      columns={["Default", "Hover", "Pressed", "Focus", "Disabled"]}
      rows={INTENTS.map(cap)}
      render={(intent, state) => (
        <span className={stateClass[state]}>
          <Button intent={intent.toLowerCase() as ButtonIntent} disabled={state === "Disabled"}>
            {intent === "Destructive" ? "Delete" : "Button"}
          </Button>
        </span>
      )}
    />
  ),
};

export const IntentBySize: Story = {
  name: "Intent × Size",
  render: () => <Matrix columns={Object.keys(SIZES)} rows={INTENTS.map(cap)} render={(intent, size) => <Button intent={intent.toLowerCase() as ButtonIntent} size={SIZES[size]}>Button</Button>} />,
};

export const WithLeadingIcon: Story = { args: { icon: "plus", children: "Save something" } };
export const Loading: Story = { args: { loading: true, children: "Saving…" } };

/** Code-side: the same Penpot Button rendered as a router link. */
export const AsLink: StoryObj<typeof ButtonLink> = {
  name: "ButtonLink (code)",
  parameters: { codeOnly: "ButtonLink — Penpot Button rendered as a router <Link>" },
  render: () => (
    <ButtonLink to="/library" intent="secondary">
      Open library
    </ButtonLink>
  ),
};
