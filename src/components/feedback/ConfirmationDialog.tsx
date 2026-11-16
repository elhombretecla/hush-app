import type { ReactNode } from "react";
import { Button } from "../actions/Button";
import { Modal } from "./Modal";

/** Penpot ConfirmationDialog — destructive, specific, reversible where possible. */
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({ open, title, children, confirmLabel, cancelLabel = "Cancel", destructive = true, onConfirm, onCancel }: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width={440}
      footer={
        <>
          <Button intent="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button intent={destructive ? "destructive" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="type-body-md muted-2">{children}</div>
    </Modal>
  );
}
