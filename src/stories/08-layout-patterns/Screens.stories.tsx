import type { Meta, StoryObj } from "@storybook/react";
import { App } from "../../app/App";
import { Button } from "../../components/actions/Button";
import { SaveContentDialog } from "../../features/save/SaveContentDialog";
import { penpot } from "../helpers";
import { useState } from "react";

/**
 * Layout patterns are compositions, not standalone components: these stories render the real app
 * routes so the catalogue shows each pattern exactly as the screens use it.
 */
const meta: Meta = { title: "08 · Layout Patterns/Screens", parameters: { layout: "fullscreen" }, render: () => <App /> };
export default meta;
type Story = StoryObj;

const FOCUS_KEY = "hush:focus";
const withFocusSession = (completed: boolean) => () => {
  const now = Date.now();
  localStorage.setItem(FOCUS_KEY, JSON.stringify({ minutes: 20, articleIds: ["gardens", "take-notes"], startedAt: now - 7 * 60_000, pausedAt: null, pausedTotal: 0, index: 0, completedAt: completed ? now : null }));
  return () => localStorage.removeItem(FOCUS_KEY);
};
const withoutFocusSession = () => {
  localStorage.removeItem(FOCUS_KEY);
};

export const DesktopAppShell: Story = { parameters: { ...penpot("DesktopAppShell"), route: "/", viewport: { defaultViewport: "desktop" } }, beforeEach: withoutFocusSession };
export const MobileAppShell: Story = { parameters: { ...penpot("MobileAppShell"), route: "/", viewport: { defaultViewport: "mobile" } }, beforeEach: withoutFocusSession };
export const FeaturedContentLayout: Story = { name: "FeaturedContentLayout (Home)", parameters: { ...penpot("FeaturedContentLayout"), route: "/" } };
export const ContentList: Story = { name: "ContentList (Inbox)", parameters: { ...penpot("ContentList"), route: "/inbox" } };
export const CollectionGrid: Story = { name: "CollectionGrid (Collections)", parameters: { ...penpot("CollectionGrid"), route: "/collections" } };
export const ReaderLayout: Story = { parameters: { ...penpot("ReaderLayout"), route: "/read/gardens" } };
export const FocusLayout: Story = { name: "FocusLayout (active session)", parameters: { ...penpot("FocusLayout"), route: "/focus" }, beforeEach: withFocusSession(false) };
export const FocusSetup: Story = { name: "Focus setup", parameters: { route: "/focus" }, beforeEach: withoutFocusSession };

/** SaveContentForm — the real Save dialog and capture flow (link capture needs the dev server's /api). */
export const SaveContentForm: Story = {
  parameters: { ...penpot("SaveContentForm"), route: "/inbox" },
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ padding: 24 }}>
        <Button icon="plus" onClick={() => setOpen(true)}>
          Save
        </Button>
        <SaveContentDialog open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
