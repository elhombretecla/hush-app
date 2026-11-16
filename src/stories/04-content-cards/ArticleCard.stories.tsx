import type { Meta, StoryObj } from "@storybook/react";
import { ArticleCard } from "../../components/content/ArticleCard";
import type { Article, ReadingStatus } from "../../data/types";
import { articleState, Matrix, noop, penpot, sample, samplePhoto } from "../helpers";

const BY_TYPE: Record<string, Article> = { Article: sample.gardens, Newsletter: sample["slow-season"], Video: sample["library-listens"], Audio: Object.values(sample).find((a) => a.type === "Audio")! };
const STATUSES: ReadingStatus[] = ["Unread", "In progress", "Completed"];

const meta: Meta<typeof ArticleCard> = {
  title: "04 · Content Cards/ArticleCard",
  component: ArticleCard,
  parameters: penpot("ArticleCard"),
  argTypes: { layout: { control: "inline-radio", options: ["featured", "standard", "compact"] }, article: { control: false }, state: { control: false } },
  args: { layout: "standard", article: sample.gardens, state: articleState("In progress"), onBookmark: noop },
};
export default meta;
type Story = StoryObj<typeof ArticleCard>;

export const Playground: Story = { render: (args) => <div style={{ maxWidth: args.layout === "featured" ? 1100 : args.layout === "compact" ? 760 : 360 }}><ArticleCard {...args} /></div> };

export const Featured: Story = { args: { layout: "featured" }, render: (args) => <div style={{ maxWidth: 1100 }}><ArticleCard {...args} /></div> };

export const StandardTypeByStatus: Story = {
  name: "Standard · Type × Status",
  render: () => (
    <Matrix columns={STATUSES} rows={Object.keys(BY_TYPE)} minWidth={300} render={(type, status) => <div style={{ width: 300 }}><ArticleCard article={BY_TYPE[type]} layout="standard" state={articleState(status as ReadingStatus)} onBookmark={noop} /></div>} />
  ),
};

export const CompactByType: Story = {
  name: "Compact · Type",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
      {Object.values(BY_TYPE).map((a, i) => (
        <ArticleCard key={a.id} article={a} layout="compact" state={articleState(STATUSES[i % 3])} onBookmark={noop} />
      ))}
    </div>
  ),
};

/** Code-side: thumbnails captured from the source (metadata image · first image · screenshot). */
export const WithCapturedImage: Story = {
  name: "With captured thumbnail (code)",
  parameters: { codeOnly: "ArticleMedia — real thumbnail with ContentCover fallback" },
  args: { article: { ...sample.gardens, image: samplePhoto, imageFrom: "metadata" } },
  render: (args) => <div style={{ width: 360 }}><ArticleCard {...args} /></div>,
};
