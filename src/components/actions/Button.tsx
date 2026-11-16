import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { Icon, type IconName } from "../brand/Icon";
import "./actions.css";

/** Penpot variant properties: Intent × Size. State (hover/pressed/focus) is handled by CSS; Disabled by the attribute. */
export type ButtonIntent = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface Common {
  intent?: ButtonIntent;
  size?: ButtonSize;
  /** Penpot "leading-icon" slot (hidden by default in the master). */
  icon?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}

export const buttonClass = ({ intent = "primary", size = "md", fullWidth }: Omit<Common, "children" | "icon">, extra = "") =>
  `button button--${intent} button--${size}${fullWidth ? " button--full" : ""} ${extra}`.trim();

export function Button({ intent, size, icon, fullWidth, loading, children, className = "", type = "button", ...rest }: Common & { loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass({ intent, size, fullWidth }, className)} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="button__spinner" aria-hidden="true" /> : icon && <Icon name={icon} size={size === "sm" ? 16 : 20} />}
      <span className="button__label">{children}</span>
    </button>
  );
}

export function ButtonLink({ intent, size, icon, fullWidth, children, className = "", ...rest }: Common & LinkProps) {
  return (
    <Link className={buttonClass({ intent, size, fullWidth }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 20} />}
      <span className="button__label">{children}</span>
    </Link>
  );
}
