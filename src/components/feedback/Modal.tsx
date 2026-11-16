import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../actions/IconButton";
import "./feedback.css";

/**
 * Penpot Modal (desktop) / BottomSheet (mobile). One accessible dialog; below 640px it docks to the
 * bottom edge with a grabber, matching the Mobile Experience sheets.
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  placement?: "center" | "end";
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, subtitle, children, footer, width = 480, placement = "center" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && node) {
        const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) (z.focus(), e.preventDefault());
        else if (!e.shiftKey && document.activeElement === z) (a.focus(), e.preventDefault());
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className={`overlay overlay--${placement}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal--${placement}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} style={{ ["--modal-width" as string]: `${width}px` }}>
        <span className="modal__grabber" aria-hidden="true" />
        <header className="modal__header">
          <div className="modal__titles">
            <h2 id={titleId} className="type-heading-4">
              {title}
            </h2>
            {subtitle && <p className="type-caption muted">{subtitle}</p>}
          </div>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
