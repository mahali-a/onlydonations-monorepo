import type { Page } from "@repo/types/payload";
import { lazy, Suspense } from "react";

type BlockType = Page["blocks"][number];

interface RenderBlocksProps {
  blocks: Page["blocks"];
  cmsBaseUrl?: string;
}

// Lazy load all blocks for optimal code splitting
const AccordionBlock = lazy(() =>
  import("./blocks/accordion-block").then((m) => ({ default: m.AccordionBlock })),
);
const ContactFormBlock = lazy(() =>
  import("./blocks/contact-form-block").then((m) => ({ default: m.ContactFormBlock })),
);
const CTABlock = lazy(() => import("./blocks/cta-block").then((m) => ({ default: m.CTABlock })));
const DividerBlock = lazy(() =>
  import("./blocks/divider-block").then((m) => ({ default: m.DividerBlock })),
);
const FAQBlock = lazy(() => import("./blocks/faq-block").then((m) => ({ default: m.FAQBlock })));
const FeatureHighlightBlock = lazy(() =>
  import("./blocks/feature-highlight-block").then((m) => ({ default: m.FeatureHighlightBlock })),
);
const FundraiserExamplesBlock = lazy(() =>
  import("./blocks/fundraiser-examples-block").then((m) => ({
    default: m.FundraiserExamplesBlock,
  })),
);
const GalleryBlock = lazy(() =>
  import("./blocks/gallery-block").then((m) => ({ default: m.GalleryBlock })),
);
const HeroBlock = lazy(() => import("./blocks/hero-block").then((m) => ({ default: m.HeroBlock })));
const HeroOverlappingBlock = lazy(() =>
  import("./blocks/hero-overlapping-block").then((m) => ({ default: m.HeroOverlappingBlock })),
);
const HowItWorksBlock = lazy(() =>
  import("./blocks/how-it-works-block").then((m) => ({ default: m.HowItWorksBlock })),
);
const IconCardsBlock = lazy(() =>
  import("./blocks/icon-cards-block").then((m) => ({ default: m.IconCardsBlock })),
);
const ImageVideoBlock = lazy(() =>
  import("./blocks/image-video-block").then((m) => ({ default: m.ImageVideoBlock })),
);
const RichTextBlock = lazy(() =>
  import("./blocks/rich-text-block").then((m) => ({ default: m.RichTextBlock })),
);
const StatsBlock = lazy(() =>
  import("./blocks/stats-block").then((m) => ({ default: m.StatsBlock })),
);
const ThreeColumnCardBlock = lazy(() =>
  import("./blocks/three-column-card-block").then((m) => ({ default: m.ThreeColumnCardBlock })),
);
const TwoColumnBlock = lazy(() =>
  import("./blocks/two-column-block").then((m) => ({ default: m.TwoColumnBlock })),
);
const PricingBlock = lazy(() =>
  import("./blocks/pricing-block").then((m) => ({ default: m.PricingBlock })),
);

export function RenderBlocks({ blocks, cmsBaseUrl = "" }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 mx-auto">
      {blocks.map((block, index) => (
        <Suspense
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks don't have stable IDs
          key={index}
          fallback={<BlockSkeleton />}
        >
          <BlockRenderer block={block} cmsBaseUrl={cmsBaseUrl} />
        </Suspense>
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
    case "pricing":
      return <PricingBlock block={block} />;
    default:
      return null;
  }
}

function BlockSkeleton() {
  return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
}
