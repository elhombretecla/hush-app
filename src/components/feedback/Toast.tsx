import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../brand/Icon";
import "./feedback.css";

/** Penpot Toast — Tone: Neutral · Success · Error, with one optional action. */
export type ToastTone = "neutral" | "success" | "error";
interface ToastData {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

/** Penpot Toast — Tone: Neutral · Success · Error, with one optional action. */
export function Toast({ tone, message, action, onAction }: { tone: ToastTone; message: string; action?: string; onAction?: () => void }) {
  return (
    <div className={`toast toast--${tone}`}>
      <Icon name={tone === "success" ? "check" : tone === "error" ? "close" : "archive"} />
      <span className="toast__message">{message}</span>
      {action && (
        <button type="button" className="toast__action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

const ToastContext = createContext<(t: Omit<ToastData, "id">) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<number>();
  const show = useCallback((t: Omit<ToastData, "id">) => {
    window.clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <Toast
            key={toast.id}
            tone={toast.tone}
            message={toast.message}
            action={toast.action?.label}
            onAction={() => {
              toast.action?.onClick();
              setToast(null);
            }}
          />
        )}
      </div>
    </ToastContext.Provider>
  );
}
