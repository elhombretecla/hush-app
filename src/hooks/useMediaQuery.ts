import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const get = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const on = () => setMatches(mql.matches);
    on();
    mql.addEventListener("change", on);
    return () => mql.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** Below 1024px HUSH uses the Mobile Experience patterns (top bar + bottom navigation). */
export const useIsCompact = () => useMediaQuery("(max-width: 1023px)");
/** Phone width (Penpot mobile frames are 390px). */
export const useIsPhone = () => useMediaQuery("(max-width: 640px)");
