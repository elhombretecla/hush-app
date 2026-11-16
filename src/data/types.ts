/** Content model. Field names mirror the properties surfaced by the Penpot ArticleCard family. */

export type ContentType = "Article" | "Newsletter" | "Video" | "Audio";
export type ReadingStatus = "Unread" | "In progress" | "Completed";
/** Penpot ContentCover variants (Tone property). */
export type CoverTone = "Moss" | "Clay" | "Honey" | "Ink" | "Paper";

export type BlockType = "lead" | "paragraph" | "subheading" | "quote" | "break";

export interface ContentBlock {
  /** Stable id used to anchor highlights. Never reuse or renumber. */
  id: string;
  type: BlockType;
  text: string;
}

export interface Article {
  id: string;
  title: string;
  dek: string;
  author: string;
  authorInitials: string;
  publication: string;
  type: ContentType;
  topics: string[];
  minutes: number;
  cover: CoverTone;
  coverCaption?: string;
  excerpt: string;
  url: string;
  savedAt: string; // ISO date
  body: ContentBlock[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  accent: "moss" | "clay" | "honey";
  covers: [CoverTone, CoverTone, CoverTone];
  articleIds: string[];
  updatedLabel: string;
}

/** Penpot HighlightActionBar swatches. */
export type HighlightColor = "honey" | "moss" | "clay";

export interface Highlight {
  id: string;
  articleId: string;
  blockId: string;
  /** Character offsets inside the block's plain text. */
  start: number;
  end: number;
  text: string;
  note?: string;
  color?: HighlightColor;
  /** Highlights created from one selection spanning several blocks share a group id. */
  groupId: string;
  createdAt: string;
}

/** Per-article reading state, persisted locally. */
export interface ArticleState {
  status: ReadingStatus;
  progress: number; // 0..1
  bookmarked: boolean;
  inInbox: boolean;
  archived: boolean;
}

export type Theme = "paper" | "night" | "sepia";
export type Density = "comfortable" | "compact";
export type ReadingFont = "Literata" | "Inter" | "Fraunces";
export type LineSpacing = "Tight" | "Comfortable" | "Airy";
export type ReadingWidth = "Narrow" | "Medium" | "Wide";

export interface ReadingPrefs {
  font: ReadingFont;
  /** Reader body size in px. Penpot default: font.size.reader = 20. */
  fontSize: number;
  lineSpacing: LineSpacing;
  width: ReadingWidth;
}

export interface Preferences {
  theme: Theme;
  density: Density;
  reading: ReadingPrefs;
  suggestCollections: boolean;
  resurfaceHighlight: boolean;
  autoArchive: boolean;
}
