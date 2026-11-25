"use client";

import type { BlockContentByType, BlockType } from "@/lib/course/blocks";
import { CalloutBlock } from "./callout";
import { DragToOrderBlock } from "./drag-to-order";
import { FlipCardBlock } from "./flip-card";
import { ImageBlock } from "./image";
import { RichTextBlock } from "./rich-text";
import { ScenarioBlock } from "./scenario";
import { VideoBlock } from "./video";

export type RenderableBlock = {
  id: string;
  position: number;
  type: BlockType;
  content: BlockContentByType[BlockType];
};

export function BlockRenderer({ block }: { block: RenderableBlock }) {
  switch (block.type) {
    case "rich_text":
      return (
        <RichTextBlock
          {...(block.content as BlockContentByType["rich_text"])}
        />
      );
    case "image":
      return <ImageBlock {...(block.content as BlockContentByType["image"])} />;
    case "video":
      return <VideoBlock {...(block.content as BlockContentByType["video"])} />;
    case "callout":
      return (
        <CalloutBlock {...(block.content as BlockContentByType["callout"])} />
      );
    case "flip_card":
      return (
        <FlipCardBlock
          {...(block.content as BlockContentByType["flip_card"])}
        />
      );
    case "scenario":
      return (
        <ScenarioBlock {...(block.content as BlockContentByType["scenario"])} />
      );
    case "drag_to_order":
      return (
        <DragToOrderBlock
          blockId={block.id}
          {...(block.content as BlockContentByType["drag_to_order"])}
        />
      );
  }
}
