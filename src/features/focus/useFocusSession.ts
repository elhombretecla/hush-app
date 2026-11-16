import { useCallback, useEffect, useState } from "react";

/** A focus session is derived from timestamps, so it survives navigation and reloads. */
export interface FocusSession {
  minutes: number;
  articleIds: string[];
  startedAt: number;
  pausedAt: number | null;
  pausedTotal: number;
  index: number;
  completedAt: number | null;
}

const KEY = "hush:focus";
const read = (): FocusSession | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
};

export function useFocusSession() {
  const [session, setSession] = useState<FocusSession | null>(read);
  const [now, setNow] = useState(Date.now());

  const save = useCallback((s: FocusSession | null) => {
    setSession(s);
    try {
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const elapsedMs = session ? (session.completedAt ?? session.pausedAt ?? now) - session.startedAt - session.pausedTotal : 0;
  const remainingMs = session ? Math.max(0, session.minutes * 60_000 - elapsedMs) : 0;
  const running = !!session && !session.pausedAt && !session.completedAt;

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (session && running && remainingMs <= 0) save({ ...session, completedAt: Date.now() });
  }, [session, running, remainingMs, save]);

  return {
    session,
    remainingMs,
    elapsedMs,
    start: (minutes: number, articleIds: string[]) => save({ minutes, articleIds, startedAt: Date.now(), pausedAt: null, pausedTotal: 0, index: 0, completedAt: null }),
    togglePause: () => {
      if (!session) return;
      if (session.pausedAt) save({ ...session, pausedTotal: session.pausedTotal + (Date.now() - session.pausedAt), pausedAt: null });
      else save({ ...session, pausedAt: Date.now() });
      setNow(Date.now());
    },
    next: () => session && save({ ...session, index: Math.min(session.index + 1, session.articleIds.length - 1) }),
    finish: () => session && save({ ...session, completedAt: Date.now(), pausedAt: null }),
    clear: () => save(null),
  };
}
