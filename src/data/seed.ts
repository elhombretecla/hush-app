import { articleById } from "./articles";
import type { ArticleState, Collection, Highlight, Preferences } from "./types";

export const seedCollections: Collection[] = [
  {
    id: "better-attention",
    name: "Better Attention",
    description: "Essays about focus, presence, and intentional living.",
    accent: "moss",
    covers: ["Honey", "Clay", "Moss"],
    articleIds: ["long-way-home", "empty-space", "fewer-tabs", "doing-less", "good-walk", "public-library"],
    updatedLabel: "updated today",
  },
  {
    id: "everyday-life",
    name: "The Shape of Everyday Life",
    description: "Ideas about habits, routines, and ordinary moments.",
    accent: "clay",
    covers: ["Paper", "Honey", "Clay"],
    articleIds: ["small-rituals", "slow-season", "take-notes", "good-walk"],
    updatedLabel: "updated Sunday",
  },
  {
    id: "quieter-web",
    name: "Designing a Quieter Web",
    description: "Thoughtful perspectives on digital design and internet culture.",
    accent: "honey",
    covers: ["Ink", "Moss", "Paper"],
    articleIds: ["gardens", "fewer-tabs", "moments-between", "library-listens", "margin-31"],
    updatedLabel: "updated last week",
  },
];

const s = (status: ArticleState["status"], progress: number, extra: Partial<ArticleState> = {}): ArticleState => ({
  status,
  progress,
  bookmarked: status !== "Unread",
  inInbox: false,
  archived: false,
  ...extra,
});

export const seedArticleState: Record<string, ArticleState> = {
  "long-way-home": s("In progress", 0.62),
  "doing-less": s("Completed", 1),
  "empty-space": s("Unread", 0),
  "small-rituals": s("Unread", 0),
  "moments-between": s("Unread", 0, { inInbox: true }),
  "public-library": s("Unread", 0, { inInbox: true }),
  "fewer-tabs": s("Completed", 1),
  "good-walk": s("Unread", 0),
  gardens: s("Unread", 0, { inInbox: true }),
  "take-notes": s("Unread", 0, { inInbox: true }),
  "slow-season": s("Unread", 0, { inInbox: true }),
  "margin-31": s("Unread", 0),
  "quiet-hour-18": s("Unread", 0, { inInbox: true }),
  "library-listens": s("Unread", 0, { inInbox: true }),
};

/** Seeds are written by text so offsets stay correct even if a block is re-worded later. */
const seedHighlight = (id: string, articleId: string, blockN: number, text: string, note: string | undefined, createdAt: string): Highlight | null => {
  const block = articleById[articleId]?.body[blockN - 1];
  const start = block ? block.text.indexOf(text) : -1;
  if (!block || start < 0) return null;
  return { id, groupId: id, articleId, blockId: block.id, start, end: start + text.length, text, note, createdAt };
};

export const seedHighlights: Highlight[] = [
  seedHighlight("h-1", "long-way-home", 2, "The long way home is not a detour from the day; it is the part of the day where the day gets digested", "This is what my Sunday walks are for. Pair with Naima Bell on walking.", "2026-11-14T18:20:00Z"),
  seedHighlight("h-2", "doing-less", 1, "Subtraction is a skill. You get better at it the way you get better at anything: by doing it badly first", undefined, "2026-11-13T09:10:00Z"),
  seedHighlight("h-3", "gardens", 2, "A garden is a place where nothing is optimized for engagement and everything is allowed to take its time.", "Use for the talk on calm software — slide 4.", "2026-11-11T21:00:00Z"),
  seedHighlight("h-4", "fewer-tabs", 2, "Every closed tab is a small decision to trust that the good things will come back around.", undefined, "2026-11-10T07:45:00Z"),
  seedHighlight("h-5", "empty-space", 2, "The margin is not wasted page — it is where the reader's own thoughts get written.", undefined, "2025-11-16T08:00:00Z"),
].filter((h): h is Highlight => h !== null);

export const defaultPreferences: Preferences = {
  theme: "paper",
  density: "comfortable",
  reading: { font: "Literata", fontSize: 20, lineSpacing: "Comfortable", width: "Medium" },
  suggestCollections: true,
  resurfaceHighlight: true,
  autoArchive: false,
};

export const seedRecentSearches = ["attention", "Mara Solis", "libraries as public space", "notes on walking"];

export const userProfile = { name: "Julia Carter", initials: "JC", email: "julia@fieldnotes.studio" };
