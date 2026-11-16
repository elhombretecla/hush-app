/**
 * Icon — same 24×24 geometry and 1.75 stroke as the Penpot "Icon / *" components
 * in HUSH / UI Kit & Components (page 01 · Buttons & Actions).
 */
const STROKE: Record<string, string> = {
  home: '<path d="M4 11 12 4.5 20 11"/><path d="M6 9.5V19.5H18V9.5"/>',
  inbox: '<path d="M4 13.5 6.5 5h11L20 13.5V19H4z"/><path d="M4 13.5h4.5a3.5 3.5 0 0 0 7 0H20"/>',
  library: '<path d="M5 4.5v15"/><path d="M9.5 4.5v15"/><path d="M14 5.5l4.5 13.5"/>',
  bookmark: '<path d="M7 4.5h10v15l-5-3.5-5 3.5z"/>',
  highlight: '<path d="M14.5 5.5l4 4L10 18H6v-4z"/><path d="M4 20.5h16"/>',
  note: '<path d="M5 5h14v10l-4 4H5z"/><path d="M15 19v-4h4"/><path d="M8.5 9h7M8.5 12.5h4"/>',
  collection: '<rect x="4" y="8" width="16" height="11.5" rx="2"/><path d="M6.5 5h11"/>',
  focus: '<path d="M6.5 19.5V11a5.5 5.5 0 0 1 11 0v8.5"/><path d="M12 16.75v.5"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  "chevron-left": '<path d="M14.5 6 8.5 12l6 6"/>',
  "chevron-right": '<path d="M9.5 6l6 6-6 6"/>',
  "chevron-down": '<path d="M6 9.5l6 6 6-6"/>',
  "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  archive: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v10h13V9"/><path d="M10 13h4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  audio: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="4.5" y="14" width="3.5" height="5.5" rx="1"/><rect x="16" y="14" width="3.5" height="5.5" rx="1"/>',
  video: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M10.5 9.5v5l4-2.5z"/>',
  newsletter: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
  article: '<path d="M6 4.5h12v15H6z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
  sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  type: '<path d="M5 6.5h14M12 6.5v12"/>',
  share: '<path d="M12 4v11M8 8l4-4 4 4"/><path d="M5.5 12.5v7h13v-7"/>',
  trash: '<path d="M5 7h14M10 4.5h4M7 7l1 12.5h8L17 7"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  grid: '<rect x="4.5" y="4.5" width="6" height="6" rx="1"/><rect x="13.5" y="4.5" width="6" height="6" rx="1"/><rect x="4.5" y="13.5" width="6" height="6" rx="1"/><rect x="13.5" y="13.5" width="6" height="6" rx="1"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5a7 7 0 0 1 14 0"/>',
  external: '<path d="M14 4.5h5.5V10M19.5 4.5 11 13"/><path d="M17 14v5.5H4.5V7H10"/>',
  tag: '<path d="M4.5 4.5h7l8 8-7 7-8-8z"/><path d="M8.5 8.5h.01"/>',
  quote: '<path d="M6 17.5c0-4.5 1.5-8 5-10M13.5 17.5c0-4.5 1.5-8 5-10"/>',
  minus: '<path d="M5 12h14"/>',
};
const FILLED: Record<string, string> = {
  "bookmark-filled": '<path d="M7 4.5h10v15l-5-3.5-5 3.5z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  more: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>',
};

export type IconName = keyof typeof STROKE | keyof typeof FILLED;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Decorative by default; pass a label to expose it to assistive tech. */
  label?: string;
}

export function Icon({ name, size = 24, className, label }: IconProps) {
  const filled = name in FILLED;
  const markup = filled ? FILLED[name] : STROKE[name];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
