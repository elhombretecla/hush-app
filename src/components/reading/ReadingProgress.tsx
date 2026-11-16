import "./reading.css";

/** Penpot ReadingProgress — hairline bar; Value 0–100. Completed renders in feedback.success. */
export function ReadingProgress({ value, label = "Reading progress" }: { value: number; label?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`reading-progress ${pct >= 100 ? "is-complete" : ""}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <span style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
