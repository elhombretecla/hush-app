import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../components/actions/Button";
import { EmptyState } from "../../components/feedback/EmptyState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Toast, useToast } from "../../components/feedback/Toast";
import { penpot, Stack } from "../helpers";

const meta: Meta = { title: "07 · Feedback & Overlays/Feedback" };
export default meta;

export const Empty: StoryObj = {
  name: "EmptyState · Kind",
  parameters: penpot("EmptyState"),
  render: () => (
    <Stack
      width={640}
      gap={40}
      items={[
        ["Inbox zero", <EmptyState kind="inbox-zero" title="Nothing waiting" description="Everything you saved has a place. Enjoy the quiet." />],
        ["No results", <EmptyState kind="no-results" title="No matches for “gardening”" description="Try a broader word, or clear the filters to see your whole library." action={<Button intent="ghost">Clear filters</Button>} />],
        ["Empty collection", <EmptyState kind="empty-collection" title="This collection is empty" description="Add pieces from your library or straight from the reader." />],
      ]}
    />
  ),
};

export const Loading: StoryObj = { name: "LoadingState", parameters: penpot("LoadingState"), render: () => <div style={{ width: 420 }}><LoadingState title="Reading the page…" detail="Title, author, text and a thumbnail" /></div> };

export const Toasts: StoryObj = {
  name: "Toast · Tone",
  parameters: penpot("Toast"),
  render: () => (
    <Stack
      items={[
        ["Neutral", <Toast tone="neutral" message="Archived “Fieldnotes No. 42”" action="Undo" />],
        ["Success", <Toast tone="success" message="Saved to your inbox" />],
        ["Error", <Toast tone="error" message="Couldn’t reach the clipboard" />],
      ]}
    />
  ),
};

/** The live toast: ToastProvider places it at the bottom of the screen and dismisses it on its own. */
export const LiveToast: StoryObj = {
  name: "Toast · live",
  parameters: penpot("Toast"),
  render: function Render() {
    const toast = useToast();
    return <Button onClick={() => toast({ tone: "neutral", message: "2 pieces deleted", action: { label: "Undo", onClick: () => toast({ tone: "success", message: "Restored" }) } })}>Show toast</Button>;
  },
};
