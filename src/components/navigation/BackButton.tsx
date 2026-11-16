import { useNavigate } from "react-router-dom";
import { Icon } from "../brand/Icon";
import "../reading/reading.css";

/** Penpot BackButton — chevron + destination label. */
export function BackButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="back-button" onClick={() => navigate(to)}>
      <Icon name="chevron-left" />
      <span>{label}</span>
    </button>
  );
}
