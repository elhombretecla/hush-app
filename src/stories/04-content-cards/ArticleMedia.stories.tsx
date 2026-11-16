import type { Meta, StoryObj } from "@storybook/react";
import { ArticleMedia } from "../../components/content/ArticleMedia";
import type { Article } from "../../data/types";
import { Matrix, penpot, sample, samplePhoto, sampleScreenshot } from "../helpers";

type Media = Pick<Article, "image" | "cover" | "imageFrom">;
/** Penpot Source → what the capture server stored on the article. */
const SOURCES: Record<string, Media> = {
  Cover: { cover: sample.gardens.cover },
  Image: { cover: sample.gardens.cover, image: samplePhoto, imageFrom: "metadata" },
  Screenshot: { cover: sample.gardens.cover, image: sampleScreenshot, imageFrom: "screenshot" },
};

const meta: Meta<typeof ArticleMedia> = {
  title: "04 · Content Cards/ArticleMedia",
  component: ArticleMedia,
  parameters: penpot("ArticleMedia"),
  argTypes: { article: { control: false } },
};
export default meta;

/**
 * Source: Cover · Image · Screenshot. In code the source comes from the captured article:
 * no image → ContentCover; `imageFrom: "screenshot"` → top-aligned crop. A broken image also falls back to the cover.
 */
export const Sources: StoryObj = {
  name: "Source: Cover · Image · Screenshot",
  render: () => (
    <Matrix
      columns={Object.keys(SOURCES)}
      rows={["Source"]}
      render={(_, source) => (
        <div style={{ width: 320, height: 200, overflow: "hidden", background: "var(--color-bg-sunken)" }}>
          <ArticleMedia article={SOURCES[source]} />
        </div>
      )}
    />
  ),
};

export const BrokenImage: StoryObj = {
  name: "Image that fails to load → Cover",
  render: () => (
    <div style={{ width: 320, height: 200, overflow: "hidden" }}>
      <ArticleMedia article={{ cover: "Moss", image: "/api/media/missing.jpg", imageFrom: "metadata" }} />
    </div>
  ),
};
