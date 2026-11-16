import { Page } from "../app/Page";
import { useStore } from "../app/store";
import { Button } from "../components/actions/Button";
import { SegmentedControl } from "../components/actions/SegmentedControl";
import { useToast } from "../components/feedback/Toast";
import { FormField, TextInput } from "../components/forms/TextInput";
import { Toggle } from "../components/forms/Toggle";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { ThemeSwitcher } from "../components/navigation/ThemeSwitcher";
import { ReadingPreferencesPanel } from "../components/reading/ReadingPreferences";
import { userProfile } from "../data/seed";
import type { Density } from "../data/types";
import "./pages.css";

const SECTIONS = ["Appearance", "Reading", "Organization", "Account"];

export function PreferencesPage() {
  const { state, getArticle, setPrefs } = useStore();
  const toast = useToast();
  const p = state.prefs;

  const exportHighlights = () => {
    const byArticle = new Map<string, string[]>();
    for (const h of state.highlights) byArticle.set(h.articleId, [...(byArticle.get(h.articleId) ?? []), `> ${h.text}${h.note ? `\n\n${h.note}` : ""}`]);
    const md = [...byArticle].map(([id, items]) => `## ${getArticle(id)?.title}\n_${getArticle(id)?.author}_\n\n${items.join("\n\n")}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([`# Highlights from hush.\n\n${md}\n`], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "hush-highlights.md" });
    a.click();
    URL.revokeObjectURL(url);
    toast({ tone: "success", message: "Highlights exported" });
  };

  return (
    <Page title="Preferences" eyebrow="Make HUSH feel like yours" mobileBar={<MobileTopBar type="title" title="Preferences" back="/" />} className="preferences">
      <h2 className="type-display-l only-desktop-block">Preferences</h2>
      <div className="prefs-layout">
        <nav className="prefs-nav" aria-label="Preference sections">
          {SECTIONS.map((s) => (
            <a key={s} href={`#prefs-${s.toLowerCase()}`} className="prefs-nav__item">
              {s}
            </a>
          ))}
        </nav>
        <div className="prefs-panels">
          <section className="prefs-panel" id="prefs-appearance" aria-labelledby="h-appearance">
            <header>
              <h3 id="h-appearance" className="type-heading-3">
                Appearance
              </h3>
              <p className="type-body-sm muted-2">Applies everywhere — the reader can also switch on its own.</p>
            </header>
            <ThemeSwitcher />
            <div className="prefs-row">
              <div>
                <p className="type-label-md">Density</p>
                <p className="type-caption muted">Compact shows more items per screen in lists and the inbox.</p>
              </div>
              <SegmentedControl<Density> label="Density" options={["comfortable", "compact"]} value={p.density} onChange={(density) => setPrefs({ density })} renderLabel={(o) => (o === "comfortable" ? "Comfortable" : "Compact")} />
            </div>
          </section>

          <section className="prefs-panel" id="prefs-reading" aria-labelledby="h-reading">
            <header>
              <h3 id="h-reading" className="type-heading-3">
                Reading
              </h3>
              <p className="type-body-sm muted-2">Tuned for long-form. Changes preview below.</p>
            </header>
            <ReadingPreferencesPanel embedded />
            <div
              className="prefs-preview"
              style={{
                fontFamily: { Literata: "var(--font-family-reading)", Inter: "var(--font-family-ui)", Fraunces: "var(--font-family-display)" }[p.reading.font],
                fontSize: p.reading.fontSize,
                lineHeight: { Tight: 1.55, Comfortable: 1.7, Airy: 1.9 }[p.reading.lineSpacing],
                maxWidth: { Narrow: 560, Medium: 680, Wide: 800 }[p.reading.width],
              }}
            >
              <span className="overline muted">
                Preview · {p.reading.font} {p.reading.fontSize}
              </span>
              <p>For years I thought this was inefficiency. I now think it was the point. The long way home is not a detour from the day; it is the part of the day where the day gets digested.</p>
            </div>
          </section>

          <section className="prefs-panel" id="prefs-organization" aria-labelledby="h-organization">
            <header>
              <h3 id="h-organization" className="type-heading-3">
                Organization
              </h3>
              <p className="type-body-sm muted-2">Gentle defaults for what happens after you save.</p>
            </header>
            <Toggle label="Suggest collections for new saves" description="Based on topics you already keep together." on={p.suggestCollections} onChange={(v) => setPrefs({ suggestCollections: v })} />
            <Toggle label="Resurface one highlight each day" description="A single passage on Highlights — never a notification." on={p.resurfaceHighlight} onChange={(v) => setPrefs({ resurfaceHighlight: v })} />
            <Toggle label="Archive finished pieces after 30 days" description="They stay searchable with their highlights." on={p.autoArchive} onChange={(v) => setPrefs({ autoArchive: v })} />
          </section>

          <section className="prefs-panel" id="prefs-account" aria-labelledby="h-account">
            <header>
              <h3 id="h-account" className="type-heading-3">
                Account
              </h3>
            </header>
            <div className="prefs-fields">
              <FormField label="Name" htmlFor="acc-name">
                <TextInput id="acc-name" defaultValue={userProfile.name} />
              </FormField>
              <FormField label="Email" htmlFor="acc-email">
                <TextInput id="acc-email" type="email" defaultValue={userProfile.email} />
              </FormField>
            </div>
            <div className="prefs-actions">
              <Button intent="secondary" onClick={exportHighlights}>
                Export highlights (Markdown)
              </Button>
              <Button
                intent="ghost"
                onClick={() => {
                  localStorage.removeItem("hush:v1");
                  localStorage.removeItem("hush:focus");
                  window.location.assign("/");
                }}
              >
                Reset demo data
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
