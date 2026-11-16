import type { Meta, StoryObj } from "@storybook/react";
import { DesktopSidebar, ProfileMenu } from "../../components/navigation/DesktopSidebar";
import { SidebarNavItem } from "../../components/navigation/SidebarNavItem";
import { Matrix, noop, penpot, pseudoStates, stateClass } from "../helpers";

const meta: Meta<typeof DesktopSidebar> = {
  title: "02 · Navigation/DesktopSidebar",
  component: DesktopSidebar,
  parameters: { ...penpot("DesktopSidebar"), layout: "fullscreen", route: "/inbox" },
  args: { onSave: noop },
};
export default meta;

export const Default: StoryObj<typeof DesktopSidebar> = { render: (args) => <div style={{ height: "100vh", display: "flex" }}><DesktopSidebar {...args} /></div> };

/** Penpot SidebarNavItem — State: Default · Hover · Active (Active comes from the current route). */
export const NavItem: StoryObj = {
  name: "SidebarNavItem · State",
  parameters: { ...penpot("SidebarNavItem"), ...pseudoStates, layout: "padded", route: "/inbox" },
  render: () => (
    <div style={{ width: 216 }}>
      <Matrix
        columns={["Item"]}
        rows={["Default", "Hover", "Active"]}
        render={(s) => (
          <span className={stateClass[s]} style={{ display: "block", width: 216 }}>
            {s === "Active" ? <SidebarNavItem to="/inbox" icon="inbox" label="Inbox" count={9} /> : <SidebarNavItem to="/library" icon="library" label="My Library" count={16} />}
          </span>
        )}
      />
    </div>
  ),
};

export const Profile: StoryObj = {
  name: "ProfileMenu",
  parameters: { ...penpot("ProfileMenu"), layout: "padded" },
  render: () => (
    <div style={{ width: 216 }}>
      <ProfileMenu name="Julia Carter" initials="JC" detail="Paper · Comfortable" />
    </div>
  ),
};
