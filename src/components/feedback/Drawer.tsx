import type { ReactNode } from "react";
import { Modal } from "./Modal";

/** Penpot Drawer — right-hand panel on desktop; a bottom sheet below 640px (Penpot BottomSheet). */
export function Drawer({ open, onClose, title, subtitle, children, width = 420 }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; width?: number }) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} placement="end" width={width}>
      {children}
    </Modal>
  );
}
