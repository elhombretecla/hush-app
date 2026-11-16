import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AuthorMetadata, ContentTypeBadge, DurationIndicator, ReadingStatus, TopicTag } from "../../components/content/meta";
import type { ContentType } from "../../data/types";
import { penpot, Stack } from "../helpers";

/** Small metadata atoms used inside cards, list rows and the reader. */
const meta: Meta = { title: "04 · Content Cards/Metadata" };
export default meta;

export const TypeBadge: StoryObj = {
  name: "ContentTypeBadge · Type",
  parameters: penpot("ContentTypeBadge"),
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(["Article", "Newsletter", "Video", "Audio", "Post"] as ContentType[]).map((t) => (
        <ContentTypeBadge key={t} type={t} />
      ))}
    </div>
  ),
};

export const Status: StoryObj = {
  name: "ReadingStatus · Status",
  parameters: penpot("ReadingStatus"),
  render: () => (
    <Stack
      items={[
        ["Unread", <ReadingStatus status="Unread" minutes={12} />],
        ["In progress", <ReadingStatus status="In progress" progress={0.62} minutes={12} />],
        ["Completed", <ReadingStatus status="Completed" minutes={12} />],
      ]}
    />
  ),
};

export const Topic: StoryObj = {
  name: "TopicTag · State: Default · Selected",
  parameters: penpot("TopicTag"),
  render: function Render() {
    const [sel, setSel] = useState("Attention");
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Attention", "Walking", "Libraries", "Digital culture"].map((t) => (
          <TopicTag key={t} label={t} selected={sel === t} onClick={() => setSel(t)} />
        ))}
      </div>
    );
  },
};

export const Author: StoryObj = { name: "AuthorMetadata", parameters: penpot("AuthorMetadata"), render: () => <AuthorMetadata author="Anika Paul" initials="AP" publication="Elsewhere Journal" /> };

export const Duration: StoryObj = { name: "DurationIndicator", parameters: penpot("DurationIndicator"), render: () => <DurationIndicator label="12 min" /> };
