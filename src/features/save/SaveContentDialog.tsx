import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../app/store";
import { Button } from "../../components/actions/Button";
import { TextButton } from "../../components/actions/TextLink";
import { Icon } from "../../components/brand/Icon";
import { ArticleCard } from "../../components/content/ArticleCard";
import { TopicTag } from "../../components/content/meta";
import { Modal } from "../../components/feedback/Modal";
import { useToast } from "../../components/feedback/Toast";
import { Select } from "../../components/forms/Select";
import { FormField, TextInput } from "../../components/forms/TextInput";
import type { Article, ContentType } from "../../data/types";
import { findExisting, looksLikeUrl } from "./catalogue";
import { ExtractError, extractLink } from "./extractClient";
import "./save.css";

type Step = "paste" | "fetching" | "preview" | "manual" | "duplicate";

/** Penpot "Save New Content" flow: paste a link → preview & organize → saved to inbox. */
export function SaveContentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, allArticles, getState, saveArticle } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const ids = { url: useId(), title: useId(), pub: useId(), min: useId() };
  const [step, setStep] = useState<Step>("paste");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Article | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [manual, setManual] = useState({ title: "", publication: "", minutes: "8", type: "Article" as ContentType });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) abort.current?.abort();
    if (open) {
      setStep("paste");
      setUrl("");
      setError("");
      setDraft(null);
      setCollectionId("");
    }
  }, [open]);

  const fetchPreview = async () => {
    if (!looksLikeUrl(url)) return setError("That link doesn’t look complete — check for a missing .com");
    const existing = findExisting(url, allArticles);
    if (existing) {
      setDraft(existing);
      return setStep("duplicate");
    }
    setError("");
    setStep("fetching");
    abort.current?.abort();
    abort.current = new AbortController();
    try {
      const article = await extractLink(url.trim(), abort.current.signal);
      const again = findExisting(article.sourceUrl ?? article.url, allArticles);
      if (again) {
        setDraft(again);
        return setStep("duplicate");
      }
      const known = new Set(allArticles.flatMap((a) => a.topics));
      const text = `${article.title} ${article.excerpt}`.toLowerCase();
      const matched = [...known].filter((t) => text.includes(t.toLowerCase()));
      setDraft({ ...article, savedAt: article.savedAt.slice(0, 10) });
      setTopics(matched.slice(0, 2));
      setStep("preview");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const host = url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
      setManual({ title: "", publication: host, minutes: "5", type: "Article" });
      setError(e instanceof ExtractError ? e.message : "We couldn’t read that link.");
      setStep("manual");
    }
  };

  const fromManual = (): Article => {
    const id = `saved-${Date.now().toString(36)}`;
    const title = manual.title.trim() || "Untitled";
    return {
      id,
      title,
      dek: "Saved from the web.",
      author: manual.publication || "Unknown author",
      authorInitials: (manual.publication || "U").slice(0, 2).toUpperCase(),
      publication: manual.publication || "The web",
      type: manual.type,
      topics: topics.length ? topics : ["Unsorted"],
      minutes: Math.max(1, Number(manual.minutes) || 5),
      cover: (["Moss", "Clay", "Honey", "Ink", "Paper"] as const)[title.length % 5],
      excerpt: `Saved from ${url.replace(/^https?:\/\//, "")}.`,
      url: url.replace(/^https?:\/\//, ""),
      sourceUrl: /^https?:\/\//.test(url.trim()) ? url.trim() : `https://${url.trim()}`,
      savedAt: new Date().toISOString().slice(0, 10),
      readable: false,
      body: [],
    };
  };

  const save = () => {
    const article = step === "manual" ? fromManual() : draft ? { ...draft, topics: topics.length ? topics : draft.topics } : null;
    if (!article) return;
    saveArticle(article, collectionId || undefined);
    onClose();
    toast({ tone: "success", message: "Saved to your inbox", action: { label: "Open inbox", onClick: () => navigate("/inbox") } });
  };

  const collectionOptions = state.collections.map((c) => ({ value: c.id, label: c.name, dot: c.accent }));
  const libraryTopics = Array.from(new Set(allArticles.flatMap((a) => a.topics))).sort();
  const suggestions = Array.from(new Set([...topics, ...libraryTopics])).slice(0, 8);

  const footer =
    step === "preview" || step === "manual" ? (
      <>
        <span className="type-caption muted save__hint">Lands in your inbox{draft ? ` · ${draft.minutes} min read` : ""}</span>
        <Button intent="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button intent="primary" onClick={save} disabled={step === "manual" && !manual.title.trim()}>
          Save to inbox
        </Button>
      </>
    ) : step === "duplicate" ? (
      <>
        <Button intent="ghost" onClick={() => setStep("paste")}>
          Paste another
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            onClose();
            navigate(`/read/${draft?.id}`);
          }}
        >
          Open it
        </Button>
      </>
    ) : (
      <>
        <Button intent="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button intent="primary" onClick={fetchPreview} disabled={!url.trim()} loading={step === "fetching"}>
          {step === "fetching" ? "Fetching…" : "Fetch preview"}
        </Button>
      </>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={560}
      title={step === "preview" ? "Looks like a good one" : step === "manual" ? "Add the details" : step === "duplicate" ? "Already in your library" : "Save something worth returning to"}
      subtitle={step === "paste" || step === "fetching" ? "Articles, newsletters, videos and posts from X, Bluesky, Mastodon or Reddit." : undefined}
      footer={footer}
    >
      <form
        className="save"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "paste") fetchPreview();
          else if (step === "preview" || step === "manual") save();
        }}
      >
        <FormField label="Link" htmlFor={ids.url} error={error || undefined}>
          <TextInput
            id={ids.url}
            icon="link"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (step !== "paste" && step !== "fetching") setStep("paste");
            }}
            placeholder="Paste a link — article, newsletter, video"
            status={step === "fetching" ? "loading" : step === "preview" || step === "duplicate" ? "valid" : error ? "error" : undefined}
            data-autofocus
            inputMode="url"
            autoComplete="off"
          />
        </FormField>

        {step === "paste" && typeof navigator !== "undefined" && navigator.clipboard?.readText && (
          <TextButton
            className="save__paste"
            onClick={async () => {
              try {
                const text = (await navigator.clipboard.readText()).trim();
                if (text) setUrl(text);
              } catch {
                /* clipboard permission denied — the field still works */
              }
            }}
          >
            <Icon name="link" size={18} /> Paste from clipboard
          </TextButton>
        )}

        {step === "fetching" && (
          <div className="save__loading" role="status">
            <span className="field__spinner" aria-hidden="true" />
            <span>
              <span className="type-label-sm">Reading the page…</span>
              <span className="type-caption muted"> Title, author, text and a thumbnail</span>
            </span>
          </div>
        )}

        {(step === "preview" || step === "duplicate") && draft && <div className="save__preview"><ArticleCard article={draft} layout="compact" state={getState(draft.id)} onBookmark={() => {}} /></div>}

        {step === "manual" && (
          <>
            <p className="type-body-sm muted-2">You can still keep the link: add a title and HUSH will save it with your notes, and you can open the original from the reader.</p>
            <FormField label="Title" htmlFor={ids.title} hint="Required">
              <TextInput id={ids.title} value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder="Give it a title" />
            </FormField>
            <div className="save__row">
              <FormField label="Publication" htmlFor={ids.pub}>
                <TextInput id={ids.pub} value={manual.publication} onChange={(e) => setManual({ ...manual, publication: e.target.value })} />
              </FormField>
              <FormField label="Minutes" htmlFor={ids.min}>
                <TextInput id={ids.min} type="number" min={1} max={240} value={manual.minutes} onChange={(e) => setManual({ ...manual, minutes: e.target.value })} />
              </FormField>
            </div>
          </>
        )}

        {step === "preview" && draft && (
          <FormField label="Title" htmlFor={ids.title}>
            <TextInput id={ids.title} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </FormField>
        )}

        {(step === "preview" || step === "manual") && (
          <>
            <div className="form-field">
              <span className="type-label-sm">Suggested topics</span>
              <div className="topic-row topic-row--wrap">
                {suggestions.map((t) => (
                  <TopicTag key={t} label={t} selected={topics.includes(t)} onClick={() => setTopics((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))} />
                ))}
              </div>
            </div>
            <div className="form-field">
              <span className="type-label-sm">Add to collection (optional)</span>
              <Select label="Collection" value={collectionId} options={collectionOptions} onChange={setCollectionId} placeholder="Keep in inbox only" />
            </div>
          </>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
