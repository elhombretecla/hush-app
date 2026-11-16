import type { Meta, StoryObj } from "@storybook/react";
import { MobileBottomNavigation, MobileTabItem } from "../../components/navigation/MobileBottomNavigation";
import { penpot } from "../helpers";

const meta: Meta<typeof MobileBottomNavigation> = {
  title: "02 · Navigation/MobileBottomNavigation",
  component: MobileBottomNavigation,
  parameters: { ...penpot("MobileBottomNavigation"), layout: "fullscreen", viewport: { defaultViewport: "mobile" }, route: "/library" },
};
export default meta;

export const Default: StoryObj = { render: () => <div style={{ height: "100vh" }}><MobileBottomNavigation /></div> };

/** Penpot MobileTabItem — State: Active · Inactive. */
export const TabItem: StoryObj = {
  name: "MobileTabItem · State: Active · Inactive",
  parameters: { ...penpot("MobileTabItem"), layout: "padded", route: "/library" },
  render: () => (
    <nav className="mobile-bottom-nav" style={{ position: "static", width: 240 }} aria-label="Tab items">
      <MobileTabItem to="/library" icon="library" label="Active" />
      <MobileTabItem to="/inbox" icon="inbox" label="Inactive" />
    </nav>
  ),
};
