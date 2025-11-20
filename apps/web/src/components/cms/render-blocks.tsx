import type { Page } from "@repo/types/payload";
import {
  AccordionBlock,
  CalculatorBlock,
  ContactFormBlock,
  CTABlock,
  DividerBlock,
  FAQBlock,
  FeatureHighlightBlock,
  FundraiserExamplesBlock,
  GalleryBlock,
  HeroBlock,
  HeroOverlappingBlock,
  HowItWorksBlock,
  IconCardsBlock,
  ImageVideoBlock,
  RichTextBlock,
  StatsBlock,
  ThreeColumnCardBlock,
  TwoColumnBlock,
} from "./blocks";

type BlockType = Page["blocks"][number];

interface RenderBlocksProps {
  blocks: Page["blocks"];
  cmsBaseUrl?: string;
}

export function RenderBlocks({ blocks, cmsBaseUrl = "" }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 mx-auto">
      {blocks.map((block, index) => (
        <BlockRenderer
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks don't have stable IDs
          key={index}
          block={block}
          cmsBaseUrl={cmsBaseUrl}
        />
      ))}
    </div>
  );
}

function BlockRenderer({ block, cmsBaseUrl }: { block: BlockType; cmsBaseUrl: string }) {
  switch (block.blockType) {
    case "hero":
      return <HeroBlock block={block} />;
    case "hero-overlapping":
      return <HeroOverlappingBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "divider":
      return <DividerBlock block={block} />;
    case "three-column-card":
      return <ThreeColumnCardBlock block={block} />;
    case "calculator":
      return <CalculatorBlock block={block} />;
    case "faq":
      return <FAQBlock block={block} />;
    case "accordion":
      return <AccordionBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "cta":
      return <CTABlock block={block} />;
    case "rich-text":
      return <RichTextBlock block={block} />;
    case "image-video":
      return <ImageVideoBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "stats":
      return <StatsBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "feature-highlight":
      return <FeatureHighlightBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "two-column":
      return <TwoColumnBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "gallery":
      return <GalleryBlock block={block} cmsBaseUrl={cmsBaseUrl} />;
    case "contact-form":
      return <ContactFormBlock block={block} />;
    case "how-it-works":
      return <HowItWorksBlock block={block} />;
    case "icon-cards":
      return <IconCardsBlock block={block} />;
    case "fundraiser-examples":
      return <FundraiserExamplesBlock block={block} />;
    default:
      return null;
  }
}
