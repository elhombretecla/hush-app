import { Link, type LinkProps } from "react-router-dom";
import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../brand/Icon";
import "./actions.css";

/** Penpot TextLink — State: Default · Hover (CSS) · Muted. */
type Tone = "default" | "muted";

export function TextLink({ tone = "default", arrow = true, children, className = "", ...rest }: LinkProps & { tone?: Tone; arrow?: boolean }) {
  return (
    <Link className={`text-link text-link--${tone} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" />}
    </Link>
  );
}

export function TextButton({ tone = "default", arrow = false, children, className = "", type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; arrow?: boolean }) {
  return (
    <button type={type} className={`text-link text-link--${tone} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" />}
    </button>
  );
}
