import type { CoverTone } from "../../data/types";

/**
 * ContentCover — the five original compositions from the Penpot "ContentCover" variant set
 * (Tone = Moss · Clay · Honey · Ink · Paper). Drawn on the same 320×200 grid; shapes keep their
 * proportions and the composition is cropped from the centre, matching the Penpot constraints.
 */
const v = (token: string) => ({ fill: `var(--palette-${token})` });

function Composition({ tone }: { tone: CoverTone }) {
  switch (tone) {
    case "Moss":
      return (
        <>
          <rect width="320" height="200" style={v("moss-800")} />
          <circle cx="290" cy="160" r="120" style={v("moss-700")} />
          <rect y="138" width="320" height="1.5" style={v("moss-300")} />
          <rect x="40" y="139" width="140" height="1.5" style={v("paper-50")} />
          <circle cx="183" cy="139" r="7" style={v("clay-300")} />
        </>
      );
    case "Clay":
      return (
        <>
          <rect width="320" height="200" style={v("clay-100")} />
          {[
            [48, 70, 130, "clay-300"],
            [104, 40, 160, "clay-500"],
            [160, 96, 104, "clay-700"],
            [216, 56, 144, "clay-200"],
          ].map(([x, y, h, c]) => (
            <rect key={x} x={x} y={y} width="36" height={Number(h) + 18} rx="18" style={v(String(c))} />
          ))}
        </>
      );
    case "Honey":
      return (
        <>
          <rect width="320" height="200" style={v("honey-100")} />
          <path d="M100 104a60 60 0 0 1 120 0v96H100z" style={v("honey-300")} />
          <circle cx="160" cy="158" r="8" style={v("ink-900")} />
          <rect y="199" width="320" height="1" style={v("ink-900")} />
        </>
      );
    case "Ink": {
      const dots = [];
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 8; k++) {
          const big = (r * 8 + k) % 7 === 3;
          const s = big ? 14 : 6;
          dots.push(<circle key={`${r}-${k}`} cx={36 + k * 34 + s / 2} cy={40 + r * 34 + s / 2} r={s / 2} style={{ ...v(big ? "clay-300" : "moss-300"), opacity: big ? 1 : 0.7 }} />);
        }
      return (
        <>
          <rect width="320" height="200" style={v("ink-950")} />
          {dots}
        </>
      );
    }
    case "Paper":
      return (
        <>
          <rect width="320" height="200" style={v("paper-200")} />
          <text x="110" y="196" style={{ ...v("ink-700"), fontFamily: "var(--font-family-display)", fontStyle: "italic", fontWeight: 300, fontSize: 260 }}>
            “
          </text>
          <rect x="40" y="40" width="1" height="120" style={v("clay-500")} />
        </>
      );
  }
}

interface ContentCoverProps {
  tone: CoverTone;
  className?: string;
}

export function ContentCover({ tone, className = "" }: ContentCoverProps) {
  return (
    <svg className={`content-cover ${className}`} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-tone={tone.toLowerCase()}>
      <Composition tone={tone} />
    </svg>
  );
}
