import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/app/App";
import { StoreProvider } from "../src/app/store";
import { ToastProvider } from "../src/components/feedback/Toast";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </StoreProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  window.scrollTo = () => {};
});

describe("HUSH app", () => {
  it("renders Home with the Penpot headline and navigation", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "A little more room to think." })).toBeInTheDocument();
    expect(within(screen.getByRole("complementary", { name: "Primary" })).getByRole("link", { name: /My Library/ })).toHaveAttribute("href", "/library");
  });

  it("filters the library by search text", async () => {
    renderAt("/library");
    await userEvent.type(screen.getByRole("searchbox", { name: "Search your library" }), "gardens");
    expect(screen.getByRole("heading", { name: "The Internet Should Have Gardens" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "A Field Guide to Doing Less" })).not.toBeInTheDocument();
  });

  it("switches appearance theme and persists it", async () => {
    renderAt("/preferences");
    await userEvent.click(screen.getAllByRole("radio", { name: /Night/ })[0]);
    expect(document.documentElement.dataset.theme).toBe("night");
    expect(JSON.parse(localStorage.getItem("hush:v1")!).prefs.theme).toBe("night");
  });

  it("toggles a bookmark and keeps it after a remount", async () => {
    const first = renderAt("/library");
    const save = screen.getByRole("button", { name: "Save “The Small Rituals That Hold a Day Together” to read later" });
    await userEvent.click(save);
    expect(save).toHaveAttribute("aria-pressed", "true");
    first.unmount();
    renderAt("/library");
    expect(screen.getByRole("button", { name: "Remove “The Small Rituals That Hold a Day Together” from read later" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the reader with the article and seeded highlight", () => {
    renderAt("/read/long-way-home");
    expect(screen.getByRole("heading", { level: 1, name: "The Beauty of Taking the Long Way Home" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Highlight with note/ }).length).toBeGreaterThan(0);
  });
});

describe("Save content", () => {
  it("reads a link through the HUSH server and saves it to the inbox", async () => {
    const captured = {
      id: "saved-abc123",
      title: "On Keeping a Commonplace Book",
      dek: "",
      author: "Claire Brooks",
      authorInitials: "CB",
      publication: "Notebook Review",
      type: "Article",
      topics: [],
      minutes: 7,
      cover: "Paper",
      image: "https://notebookreview.com/covers/commonplace.jpg",
      imageFrom: "metadata",
      excerpt: "A notebook for other people's sentences.",
      url: "notebookreview.com/commonplace-book",
      sourceUrl: "https://notebookreview.com/commonplace-book",
      savedAt: "2026-11-16T10:00:00.000Z",
      body: [{ id: "saved-abc123-1", type: "lead", text: "For three centuries readers kept a book of other people's sentences." }],
      readable: true,
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ article: captured }) });
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/inbox");
    await userEvent.click(screen.getAllByRole("button", { name: /Save/ }).find((b) => b.textContent?.includes("Save something"))!);
    await userEvent.type(screen.getByPlaceholderText(/Paste a link/), "https://notebookreview.com/commonplace-book");
    await userEvent.click(screen.getByRole("button", { name: "Fetch preview" }));
    expect(await screen.findByRole("heading", { name: "Looks like a good one" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/extract", expect.objectContaining({ method: "POST" }));
    await userEvent.click(screen.getByRole("button", { name: "Save to inbox" }));
    expect(await screen.findByRole("link", { name: "On Keeping a Commonplace Book" })).toHaveAttribute("href", "/read/saved-abc123");
    vi.unstubAllGlobals();
  });
});

describe("Deleting a piece", () => {
  it("removes it from the library with its highlights, and Undo brings it back", async () => {
    renderAt("/read/gardens");
    await userEvent.click(screen.getByRole("button", { name: "Delete from library" }));
    expect(screen.getByRole("dialog", { name: "Delete from your library?" })).toHaveTextContent("1 highlight");
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    expect((await screen.findAllByRole("heading", { name: "My Library" })).length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "The Internet Should Have Gardens" })).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("hush:v1")!);
    expect(stored.deletedIds).toContain("gardens");
    expect(stored.highlights.some((h: { articleId: string }) => h.articleId === "gardens")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("heading", { name: "The Internet Should Have Gardens" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("hush:v1")!).highlights.some((h: { articleId: string }) => h.articleId === "gardens")).toBe(true);
  });
});
