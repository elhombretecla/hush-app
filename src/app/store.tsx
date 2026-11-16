import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { articles as seedArticles } from "../data/articles";
import { defaultPreferences, seedArticleState, seedCollections, seedHighlights, seedRecentSearches } from "../data/seed";
import type { Article, ArticleState, Collection, Highlight, Preferences, ReadingPrefs } from "../data/types";

const STORAGE_KEY = "hush:v1";

interface State {
  savedArticles: Article[]; // added by the user through Save
  articleState: Record<string, ArticleState>;
  collections: Collection[];
  highlights: Highlight[];
  prefs: Preferences;
  recentSearches: string[];
}

type Action =
  | { type: "patchArticle"; id: string; patch: Partial<ArticleState> }
  | { type: "saveArticle"; article: Article; collectionId?: string }
  | { type: "replaceArticle"; article: Article }
  | { type: "setCollectionMembership"; collectionId: string; articleId: string; member: boolean }
  | { type: "createCollection"; collection: Collection }
  | { type: "addHighlights"; highlights: Highlight[] }
  | { type: "updateHighlight"; id: string; patch: Partial<Highlight> }
  | { type: "removeHighlightGroup"; groupId: string }
  | { type: "setPrefs"; patch: Partial<Preferences> }
  | { type: "setReading"; patch: Partial<ReadingPrefs> }
  | { type: "addSearch"; query: string };

const initialState = (): State => ({
  savedArticles: [],
  articleState: structuredClone(seedArticleState),
  collections: structuredClone(seedCollections),
  highlights: structuredClone(seedHighlights),
  prefs: structuredClone(defaultPreferences),
  recentSearches: [...seedRecentSearches],
});

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<State>;
    const base = initialState();
    return {
      ...base,
      ...parsed,
      articleState: { ...base.articleState, ...parsed.articleState },
      prefs: { ...base.prefs, ...parsed.prefs, reading: { ...base.prefs.reading, ...parsed.prefs?.reading } },
    };
  } catch {
    return initialState();
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "patchArticle": {
      const current = state.articleState[action.id] ?? { status: "Unread", progress: 0, bookmarked: false, inInbox: false, archived: false };
      return { ...state, articleState: { ...state.articleState, [action.id]: { ...current, ...action.patch } } };
    }
    case "saveArticle": {
      const exists = state.savedArticles.some((a) => a.id === action.article.id) || seedArticles.some((a) => a.id === action.article.id);
      const collections = action.collectionId
        ? state.collections.map((c) => (c.id === action.collectionId && !c.articleIds.includes(action.article.id) ? { ...c, articleIds: [action.article.id, ...c.articleIds], updatedLabel: "updated just now" } : c))
        : state.collections;
      return {
        ...state,
        savedArticles: exists ? state.savedArticles : [action.article, ...state.savedArticles],
        articleState: { ...state.articleState, [action.article.id]: { status: "Unread", progress: 0, bookmarked: false, inInbox: true, archived: false, ...(exists ? state.articleState[action.article.id] : {}) } },
        collections,
      };
    }
    case "replaceArticle": {
      // Re-captured text: keep only highlights whose text still sits at the same place.
      const blocks = Object.fromEntries(action.article.body.map((b) => [b.id, b.text]));
      return {
        ...state,
        savedArticles: state.savedArticles.map((a) => (a.id === action.article.id ? { ...action.article, topics: a.topics, savedAt: a.savedAt } : a)),
        highlights: state.highlights.filter((h) => h.articleId !== action.article.id || blocks[h.blockId]?.slice(h.start, h.end) === h.text),
      };
    }
    case "setCollectionMembership":
      return {
        ...state,
        collections: state.collections.map((c) => {
          if (c.id !== action.collectionId) return c;
          const has = c.articleIds.includes(action.articleId);
          if (action.member === has) return c;
          return { ...c, updatedLabel: "updated just now", articleIds: action.member ? [action.articleId, ...c.articleIds] : c.articleIds.filter((id) => id !== action.articleId) };
        }),
      };
    case "createCollection":
      return { ...state, collections: [...state.collections, action.collection] };
    case "addHighlights":
      return { ...state, highlights: [...action.highlights, ...state.highlights] };
    case "updateHighlight":
      return { ...state, highlights: state.highlights.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)) };
    case "removeHighlightGroup":
      return { ...state, highlights: state.highlights.filter((h) => h.groupId !== action.groupId) };
    case "setPrefs":
      return { ...state, prefs: { ...state.prefs, ...action.patch } };
    case "setReading":
      return { ...state, prefs: { ...state.prefs, reading: { ...state.prefs.reading, ...action.patch } } };
    case "addSearch": {
      const q = action.query.trim();
      if (!q) return state;
      return { ...state, recentSearches: [q, ...state.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 6) };
    }
  }
}

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — the app keeps working in memory */
    }
  }, [state]);

  // The Penpot "Appearance" and "Density" themes map to attributes on <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = state.prefs.theme;
    document.documentElement.dataset.density = state.prefs.density;
  }, [state.prefs.theme, state.prefs.density]);

  const allArticles = useMemo(() => [...state.savedArticles, ...seedArticles], [state.savedArticles]);
  const getArticle = useCallback((id: string) => allArticles.find((a) => a.id === id), [allArticles]);
  const getState = useCallback(
    (id: string): ArticleState => state.articleState[id] ?? { status: "Unread", progress: 0, bookmarked: false, inInbox: false, archived: false },
    [state.articleState],
  );

  const actions = useMemo(
    () => ({
      toggleBookmark: (id: string, current: boolean) => dispatch({ type: "patchArticle", id, patch: { bookmarked: !current } }),
      setProgress: (id: string, progress: number) =>
        dispatch({ type: "patchArticle", id, patch: { progress, status: progress >= 0.98 ? "Completed" : progress > 0.02 ? "In progress" : "Unread" } }),
      markFinished: (id: string) => dispatch({ type: "patchArticle", id, patch: { progress: 1, status: "Completed", inInbox: false } }),
      archive: (id: string) => dispatch({ type: "patchArticle", id, patch: { archived: true, inInbox: false } }),
      fileFromInbox: (id: string) => dispatch({ type: "patchArticle", id, patch: { inInbox: false } }),
      saveArticle: (article: Article, collectionId?: string) => dispatch({ type: "saveArticle", article, collectionId }),
      replaceArticle: (article: Article) => dispatch({ type: "replaceArticle", article }),
      setCollectionMembership: (collectionId: string, articleId: string, member: boolean) => dispatch({ type: "setCollectionMembership", collectionId, articleId, member }),
      createCollection: (collection: Collection) => dispatch({ type: "createCollection", collection }),
      addHighlights: (highlights: Highlight[]) => dispatch({ type: "addHighlights", highlights }),
      updateHighlight: (id: string, patch: Partial<Highlight>) => dispatch({ type: "updateHighlight", id, patch }),
      removeHighlightGroup: (groupId: string) => dispatch({ type: "removeHighlightGroup", groupId }),
      setPrefs: (patch: Partial<Preferences>) => dispatch({ type: "setPrefs", patch }),
      setReading: (patch: Partial<ReadingPrefs>) => dispatch({ type: "setReading", patch }),
      addSearch: (query: string) => dispatch({ type: "addSearch", query }),
    }),
    [],
  );

  return { state, allArticles, getArticle, getState, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const resetStoreForTests = () => localStorage.removeItem(STORAGE_KEY);
