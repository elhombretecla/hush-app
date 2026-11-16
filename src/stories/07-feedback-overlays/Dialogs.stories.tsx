import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../components/actions/Button";
import { ConfirmationDialog } from "../../components/feedback/ConfirmationDialog";
import { Drawer } from "../../components/feedback/Drawer";
import { Modal } from "../../components/feedback/Modal";
import { Popover } from "../../components/feedback/Popover";
import { ReadingPreferences } from "../../components/reading/ReadingPreferences";
import { penpot } from "../helpers";

/** Overlays open over the page; each story starts open — close it and use the button to reopen. */
const meta: Meta = { title: "07 · Feedback & Overlays/Overlays", parameters: { layout: "fullscreen" } };
export default meta;

function Opener({ label, children }: { label: string; children: (open: boolean, close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <Button intent="secondary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      {children(open, () => setOpen(false))}
    </div>
  );
}

export const ModalDialog: StoryObj = {
  name: "Modal",
  parameters: penpot("Modal"),
  render: () => (
    <Opener label="Open modal">
      {(open, close) => (
        <Modal open={open} onClose={close} title="New collection" subtitle="Group pieces you want to read together." footer={<><Button intent="secondary" onClick={close}>Cancel</Button><Button onClick={close}>Create</Button></>}>
          <p className="type-body-md muted-2">Collections are quiet shelves — no counts to chase, just pieces that belong together.</p>
        </Modal>
      )}
    </Opener>
  ),
};

/** Below 640px the same Modal docks to the bottom edge — Penpot BottomSheet. */
export const BottomSheet: StoryObj = {
  name: "BottomSheet (Modal on mobile)",
  parameters: { ...penpot("BottomSheet"), viewport: { defaultViewport: "mobile" } },
  render: () => (
    <Opener label="Open sheet">
      {(open, close) => (
        <Modal open={open} onClose={close} title="Reading preferences">
          <ReadingPreferences embedded showWidth={false} />
        </Modal>
      )}
    </Opener>
  ),
};

export const Confirmation: StoryObj = {
  name: "ConfirmationDialog",
  parameters: penpot("ConfirmationDialog"),
  render: () => (
    <Opener label="Delete…">
      {(open, close) => (
        <ConfirmationDialog open={open} title="Delete from your library?" confirmLabel="Delete" cancelLabel="Keep it" onConfirm={close} onCancel={close}>
          <p>“The Internet Should Have Gardens” will be removed from your library and collections, together with its 1 highlight. You can undo this for a few seconds.</p>
        </ConfirmationDialog>
      )}
    </Opener>
  ),
};

export const SideDrawer: StoryObj = {
  name: "Drawer",
  parameters: penpot("Drawer"),
  render: () => (
    <Opener label="Open drawer">
      {(open, close) => (
        <Drawer open={open} onClose={close} title="Highlights · 3" subtitle="The Internet Should Have Gardens" width={400}>
          <p className="type-body-md muted-2">Highlights and notes for the piece you are reading.</p>
        </Drawer>
      )}
    </Opener>
  ),
};

export const PrefsPopover: StoryObj = {
  name: "Popover",
  parameters: { ...penpot("Popover"), layout: "padded" },
  render: () => (
    <div style={{ position: "relative", height: 560 }}>
      <Popover label="Reading preferences" className="reading-prefs--popover" >
        <ReadingPreferences onClose={() => {}} />
      </Popover>
    </div>
  ),
};
