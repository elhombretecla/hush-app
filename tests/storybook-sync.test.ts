import { describe, expect, it } from "vitest";
import { syncReport, type StoryModule } from "../src/stories/sync";

const modules = import.meta.glob<StoryModule>("../src/stories/**/*.stories.tsx", { eager: true });

describe("Storybook ↔ Penpot UI Kit", () => {
  const report = syncReport(modules);

  it("has a story (or a documented reason) for every Penpot component", () => {
    const missing = report.pages.flatMap((p) => p.rows.filter((r) => r.status === "missing").map((r) => `${p.page} / ${r.name}`));
    expect(missing).toEqual([]);
  });

  it("only names components that exist in Penpot", () => {
    expect(report.unknown).toEqual([]);
  });

  it("covers the brand marks from Design Foundations", () => {
    expect(report.brand.filter((b) => !b.inCode)).toEqual([]);
  });
});
