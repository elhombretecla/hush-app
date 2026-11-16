import type { Meta, StoryObj } from "@storybook/react";
import { PullQuote, ReadingContentBlock } from "../../components/reading/ReadingContentBlock";
import { TextHighlight } from "../../components/reading/TextHighlight";
import type { ContentBlock } from "../../data/types";
import { highlight, penpot, sample, samplePhoto, Stack } from "../helpers";

const block = (type: ContentBlock["type"]) => sample.gardens.body.find((b) => b.type === type)!;
const article = sample[highlight.articleId];
const withHighlight = article.body.find((b) => b.id === highlight.blockId)!;

const meta: Meta<typeof ReadingContentBlock> = {
  title: "05 · Reading Components/ReadingContentBlock",
  component: ReadingContentBlock,
  parameters: penpot("ReadingContentBlock"),
  decorators: [(Story) => <div className="reader" style={{ minHeight: 0, padding: 24 }}><article className="reader__article" style={{ maxWidth: 680 }}><Story /></article></div>],
};
export default meta;

export const Types: StoryObj = {
  name: "Type: Lead · Paragraph · Subheading · Section break",
  render: () => (
    <Stack
      items={[
        ["Lead", <ReadingContentBlock block={block("lead")} highlights={[]} author="Anika Paul" />],
        ["Paragraph", <ReadingContentBlock block={block("paragraph")} highlights={[]} author="Anika Paul" />],
        ["Subheading", <ReadingContentBlock block={block("subheading")} highlights={[]} author="Anika Paul" />],
        ["Section break", <ReadingContentBlock block={{ id: "sb", type: "break", text: "· · ·" }} highlights={[]} author="Anika Paul" />],
        ["Image (code: captured articles)", <ReadingContentBlock block={{ id: "img", type: "image", text: "Evening light over the allotments", src: samplePhoto }} highlights={[]} author="" />],
      ]}
    />
  ),
};

export const Quote: StoryObj = { name: "PullQuote", parameters: penpot("PullQuote"), render: () => <PullQuote block={block("quote")} highlights={[]} author="Anika Paul" /> };

export const Highlighted: StoryObj = {
  name: "TextHighlight · State: Default · Hover · With note",
  parameters: { ...penpot("TextHighlight"), pseudo: { hover: [".is-sb-hover", ".is-sb-hover *"] } },
  render: () => (
    <Stack
      items={[
        ["In a paragraph", <ReadingContentBlock block={withHighlight} highlights={[highlight]} author={article.author} />],
        [
          "Default · Hover · With note · colours",
          <p className="reading-block reading-block--paragraph">
            <TextHighlight label="Default">a quiet default</TextHighlight>, <span className="is-sb-hover"><TextHighlight label="Hover">a hovered one</TextHighlight></span>, <TextHighlight label="With note" withNote>one with a note</TextHighlight>, <TextHighlight label="Moss" color="moss">moss</TextHighlight> and <TextHighlight label="Clay" color="clay">clay</TextHighlight>.
          </p>,
        ],
      ]}
    />
  ),
};
