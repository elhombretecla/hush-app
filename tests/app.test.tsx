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
