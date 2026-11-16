import type { Article, ArticleState, Collection } from "../data/types";

export const greeting = (d = new Date()) => (d.getHours() < 12 ? "Good morning" : d.getHours() < 18 ? "Good afternoon" : "Good evening");

export const todayLabel = (d = new Date()) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

export function collectionProgress(c: Collection, getArticle: (id: string) => Article | undefined, getState: (id: string) => ArticleState) {
  const inProgress = c.articleIds.filter((id) => getState(id).status === "In progress");
  const unread = c.articleIds.filter((id) => getState(id).status !== "Completed");
  if (!unread.length) return "All read";
  const minutesLeft = unread.reduce((sum, id) => {
    const a = getArticle(id);
    return a ? sum + Math.round(a.minutes * (1 - getState(id).progress)) : sum;
  }, 0);
  const time = minutesLeft >= 60 ? `${Math.floor(minutesLeft / 60)} h ${minutesLeft % 60} min` : `${minutesLeft} min`;
  return `${inProgress.length ? `${inProgress.length} in progress · ` : ""}${time} left`;
}

export const savedAgo = (iso: string, now = new Date()) => {
  const days = Math.round((now.getTime() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "saved today";
  if (days === 1) return "saved yesterday";
  if (days < 7) return `saved ${new Date(iso).toLocaleDateString("en-GB", { weekday: "long" })}`;
  return `saved ${new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
};
