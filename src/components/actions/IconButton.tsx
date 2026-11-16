import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../brand/Icon";
import "./actions.css";

/** Penpot IconButton — Style: Ghost · Outline · Filled. 40 × 40 (size.control.md). */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  variant?: "ghost" | "outline" | "filled";
  pressed?: boolean;
}

export function IconButton({ icon, label, variant = "ghost", pressed, className = "", type = "button", ...rest }: IconButtonProps) {
  return (
    <button type={type} className={`icon-button icon-button--${variant} ${pressed ? "is-pressed" : ""} ${className}`} aria-label={label} title={label} aria-pressed={pressed} {...rest}>
      <Icon name={icon} />
    </button>
  );
}
