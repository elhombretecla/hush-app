import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "../brand/Icon";
import "./forms.css";

/** Penpot TextInput / URLInput — State: Default · Focus (CSS) · Filled · Error · Disabled; URLInput adds Loading · Valid. */
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
  status?: "loading" | "valid" | "error";
  trailing?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({ icon, status, trailing, className = "", ...rest }, ref) {
  return (
    <div className={`field ${status === "error" ? "is-error" : ""} ${rest.disabled ? "is-disabled" : ""} ${className}`}>
      {icon && <Icon name={icon} />}
      <input ref={ref} aria-invalid={status === "error" || undefined} {...rest} />
      {status === "loading" && <span className="field__spinner" role="status" aria-label="Loading" />}
      {status === "valid" && <span className="field__valid"><Icon name="check" label="Valid link" /></span>}
      {status === "error" && <span className="field__invalid"><Icon name="close" /></span>}
      {trailing}
    </div>
  );
});

export function TextArea({ className = "", maxLength = 500, value, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  return (
    <div className={`field field--area ${className}`}>
      <textarea maxLength={maxLength} value={value} {...rest} />
      <span className="field__counter" aria-hidden="true">
        {value.length} / {maxLength}
      </span>
    </div>
  );
}

/** Penpot FormField — label · input · helper or FormError. */
export function FormField({ label, hint, helper, error, htmlFor, children }: { label: string; hint?: string; helper?: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="form-field">
      <div className="form-field__label-row">
        <label htmlFor={htmlFor} className="type-label-sm">
          {label}
        </label>
        {hint && <span className="type-caption muted">{hint}</span>}
      </div>
      {children}
      {error ? <FormError message={error} /> : helper && <p className="type-body-sm muted">{helper}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="form-error" role="alert">
      <span className="form-error__mark" aria-hidden="true">
        !
      </span>
      {message}
    </p>
  );
}
