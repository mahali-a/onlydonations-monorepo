import type {
  AccordionBlock as AccordionBlockType,
  CalculatorBlock as CalculatorBlockType,
  ContactFormBlock as ContactFormBlockType,
  CTABlock as CTABlockType,
  DividerBlock as DividerBlockType,
  FAQBlock as FAQBlockType,
  FeatureHighlightBlock as FeatureHighlightBlockType,
  GalleryBlock as GalleryBlockType,
  HeroBlock as HeroBlockType,
  ImageVideoBlock as ImageVideoBlockType,
  Media,
  Page,
  RichTextBlock as RichTextBlockType,
  StatsBlock as StatsBlockType,
  ThreeColumnCardBlock as ThreeColumnCardBlockType,
  TwoColumnBlock as TwoColumnBlockType,
} from "@repo/types/payload";
import { cn } from "@/lib/utils";
import { RichText } from "./rich-text";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type BlockType = Page["blocks"][number];

// Helper to get background color class
function getBgColorClass(
  color: "white" | "gray-light" | "green-light" | "primary" | null | undefined,
) {
  switch (color) {
    case "gray-light":
      return "bg-muted";
    case "green-light":
      return "bg-green-50 dark:bg-green-950";
    case "primary":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-background";
  }
}

// Helper to get image URL with CMS base
function getImageUrl(image: Media | number | null | undefined, cmsBaseUrl: string): string | null {
  if (!image || typeof image === "number") return null;
  const url = image.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${cmsBaseUrl}${url}`;
}

// Helper to extract video embed
function getVideoEmbed(url: string | null | undefined) {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (youtubeMatch) {
    return {
      type: "youtube" as const,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo" as const,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return null;
}

interface RenderBlocksProps {
  blocks: Page["blocks"];
  cmsBaseUrl?: string;
}

export function RenderBlocks({ blocks, cmsBaseUrl = "" }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div>
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
    default:
      return null;
  }
}

// =============================================================================
// HERO BLOCK
// =============================================================================
function HeroBlock({ block }: { block: HeroBlockType }) {
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[block.alignment || "center"];

  const sizeClass = {
    small: "py-12 md:py-16",
    medium: "py-16 md:py-24",
    large: "py-24 md:py-32",
  }[block.responsive?.desktopSize || "medium"];

  return (
    <section className={cn(sizeClass, alignmentClass)}>
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {block.title}
          </h1>
          {block.subtitle && (
            <p className="text-xl text-muted-foreground md:text-2xl">{block.subtitle}</p>
          )}
          {block.description && (
            <div className="text-lg text-muted-foreground">
              <RichText content={block.description} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// DIVIDER BLOCK
// =============================================================================
function DividerBlock({ block }: { block: DividerBlockType }) {
  const styleClass = {
    thin: "border-t",
    thick: "border-t-2",
    dashed: "border-t border-dashed",
  }[block.style || "thin"];

  const colorClass = {
    "gray-light": "border-muted",
    "gray-dark": "border-muted-foreground",
    "green-light": "border-green-200 dark:border-green-800",
    primary: "border-primary",
  }[block.color || "gray-light"];

  return (
    <div
      style={{
        paddingTop: block.spacing?.topMobile ?? 16,
        paddingBottom: block.spacing?.bottomMobile ?? 16,
      }}
    >
      <div className="container px-4">
        <hr className={cn(styleClass, colorClass)} />
      </div>
    </div>
  );
}

// =============================================================================
// CTA BLOCK
// =============================================================================
function CTABlock({ block }: { block: CTABlockType }) {
  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[block.alignment || "center"];

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        <div className={cn("flex flex-col gap-6 max-w-3xl mx-auto", alignmentClass)}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{block.title}</h2>
          {block.description && (
            <div className="text-lg opacity-90">
              <RichText content={block.description} />
            </div>
          )}
          {block.buttons && block.buttons.length > 0 && (
            <div
              className={cn(
                "flex gap-4",
                block.responsive?.buttonStackMobile && "flex-col sm:flex-row",
                block.alignment === "center" && "justify-center",
              )}
            >
              {block.buttons.map((button) => (
                <Button
                  key={button.id}
                  variant={
                    button.buttonStyle === "primary"
                      ? "default"
                      : button.buttonStyle === "secondary"
                        ? "secondary"
                        : "outline"
                  }
                  size={
                    button.buttonSize === "small"
                      ? "sm"
                      : button.buttonSize === "large"
                        ? "lg"
                        : "default"
                  }
                  asChild
                >
                  <a href={button.buttonLink}>{button.buttonText}</a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// STATS BLOCK
// =============================================================================
function StatsBlock({ block, cmsBaseUrl }: { block: StatsBlockType; cmsBaseUrl: string }) {
  const columnsClass = {
    "2": "grid-cols-2",
    "3": "grid-cols-2 md:grid-cols-3",
    "4": "grid-cols-2 md:grid-cols-4",
  }[block.layout || "4"];

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        {(block.title || block.description) && (
          <div className="text-center mb-10">
            {block.title && (
              <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
            )}
            {block.description && (
              <div className="text-muted-foreground max-w-2xl mx-auto">
                <RichText content={block.description} />
              </div>
            )}
          </div>
        )}
        {block.stats && block.stats.length > 0 && (
          <div className={cn("grid gap-8", columnsClass)}>
            {block.stats.map((stat) => {
              const iconUrl = getImageUrl(stat.icon, cmsBaseUrl);
              return (
                <div key={stat.id} className="text-center">
                  {iconUrl && (
                    <img src={iconUrl} alt="" className="w-12 h-12 mx-auto mb-4 object-contain" />
                  )}
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </div>
                  {stat.description && (
                    <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// FAQ BLOCK
// =============================================================================
function FAQBlock({ block }: { block: FAQBlockType }) {
  if (!block.faqs || block.faqs.length === 0) return null;

  const isExpanded = block.displayStyle === "expanded";
  const isTwoColumn = block.displayStyle === "two-column";

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        {block.title && (
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10">{block.title}</h2>
        )}

        {isExpanded ? (
          <div
            className={cn(
              "space-y-6 max-w-3xl mx-auto",
              isTwoColumn && "md:grid md:grid-cols-2 md:gap-8 md:space-y-0",
            )}
          >
            {block.faqs.map((faq) => (
              <div key={faq.id} className="space-y-2">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <div className="text-muted-foreground">
                  <RichText content={faq.answer} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {block.faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <RichText content={faq.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// ACCORDION BLOCK
// =============================================================================
function AccordionBlock({ block, cmsBaseUrl }: { block: AccordionBlockType; cmsBaseUrl: string }) {
  if (!block.items || block.items.length === 0) return null;

  const maxWidthClass = {
    full: "max-w-none",
    large: "max-w-4xl",
    medium: "max-w-3xl",
    small: "max-w-2xl",
  }[block.responsive?.maxWidth || "medium"];

  const defaultOpenIndex = block.defaultOpenIndex ?? -1;
  const defaultValue = defaultOpenIndex >= 0 ? `item-${defaultOpenIndex}` : undefined;

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        <div className={cn(maxWidthClass, "mx-auto")}>
          {(block.title || block.description) && (
            <div className="text-center mb-8">
              {block.title && (
                <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
              )}
              {block.description && (
                <div className="text-muted-foreground">
                  <RichText content={block.description} />
                </div>
              )}
            </div>
          )}

          {block.allowMultipleOpen ? (
            <Accordion type="multiple" defaultValue={defaultValue ? [defaultValue] : undefined}>
              {block.items.map((item, index) => {
                const iconUrl = getImageUrl(item.icon, cmsBaseUrl);
                return (
                  <AccordionItem key={item.id} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-3">
                        {iconUrl && <img src={iconUrl} alt="" className="w-5 h-5 object-contain" />}
                        {item.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <RichText content={item.content} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Accordion type="single" defaultValue={defaultValue} collapsible>
              {block.items.map((item, index) => {
                const iconUrl = getImageUrl(item.icon, cmsBaseUrl);
                return (
                  <AccordionItem key={item.id} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-3">
                        {iconUrl && <img src={iconUrl} alt="" className="w-5 h-5 object-contain" />}
                        {item.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <RichText content={item.content} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// RICH TEXT BLOCK
// =============================================================================
function RichTextBlock({ block }: { block: RichTextBlockType }) {
  const maxWidthClass = {
    full: "max-w-none",
    large: "max-w-6xl",
    medium: "max-w-4xl",
    small: "max-w-2xl",
  }[block.maxWidth || "full"];

  const alignmentClass = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }[block.alignment || "left"];

  return (
    <section
      className="py-8 md:py-12"
      style={{
        paddingTop: block.spacing?.topMobile ?? 16,
        paddingBottom: block.spacing?.bottomMobile ?? 16,
      }}
    >
      <div className="container px-4">
        <div className={cn(maxWidthClass, alignmentClass)}>
          <RichText content={block.content} />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// IMAGE/VIDEO BLOCK
// =============================================================================
function ImageVideoBlock({
  block,
  cmsBaseUrl,
}: {
  block: ImageVideoBlockType;
  cmsBaseUrl: string;
}) {
  const widthClass = {
    full: "max-w-none",
    large: "max-w-6xl",
    medium: "max-w-4xl",
    small: "max-w-2xl",
  }[block.width || "full"];

  const alignmentClass = {
    left: "mr-auto text-left",
    center: "mx-auto text-center",
    right: "ml-auto text-right",
  }[block.alignment || "center"];

  const image = typeof block.image === "object" ? (block.image as Media) : null;
  const imageUrl = getImageUrl(image, cmsBaseUrl);
  const videoEmbed = getVideoEmbed(block.videoUrl);

  return (
    <section
      className="py-8 md:py-12"
      style={{
        paddingTop: block.spacing?.topMobile ?? 16,
        paddingBottom: block.spacing?.bottomMobile ?? 16,
      }}
    >
      <div className="container px-4">
        <figure className={cn(widthClass, alignmentClass)}>
          {block.mediaType === "image" && imageUrl && (
            <img
              src={imageUrl}
              alt={block.altText || image?.alt || ""}
              width={image?.width || undefined}
              height={image?.height || undefined}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          )}

          {block.mediaType === "video" && videoEmbed && (
            <div className="relative w-full aspect-video">
              <iframe
                src={videoEmbed.embedUrl}
                title={block.caption || "Video"}
                className="absolute inset-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {block.caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">{block.caption}</figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

// =============================================================================
// FEATURE HIGHLIGHT BLOCK
// =============================================================================
function FeatureHighlightBlock({
  block,
  cmsBaseUrl,
}: {
  block: FeatureHighlightBlockType;
  cmsBaseUrl: string;
}) {
  if (!block.features || block.features.length === 0) return null;

  const columnsClass = {
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[block.layout || "3"];

  const iconSizeClass = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  }[block.iconSize || "medium"];

  const alignmentClass =
    block.alignment === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        {(block.title || block.description) && (
          <div className="text-center mb-10">
            {block.title && (
              <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
            )}
            {block.description && (
              <div className="text-muted-foreground max-w-2xl mx-auto">
                <RichText content={block.description} />
              </div>
            )}
          </div>
        )}

        <div className={cn("grid gap-8", columnsClass)}>
          {block.features.map((feature) => {
            const iconUrl = getImageUrl(feature.icon, cmsBaseUrl);
            return (
              <div key={feature.id} className={cn("flex flex-col gap-4", alignmentClass)}>
                {iconUrl && (
                  <img src={iconUrl} alt="" className={cn(iconSizeClass, "object-contain")} />
                )}
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                {feature.description && (
                  <div className="text-muted-foreground">
                    <RichText content={feature.description} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// TWO COLUMN BLOCK
// =============================================================================
function TwoColumnBlock({ block, cmsBaseUrl }: { block: TwoColumnBlockType; cmsBaseUrl: string }) {
  const ratioClass = {
    "50-50": "md:grid-cols-2",
    "60-40": "md:grid-cols-[3fr_2fr]",
    "40-60": "md:grid-cols-[2fr_3fr]",
  }[block.responsive?.columnRatio || "50-50"];

  const renderColumn = (content: TwoColumnBlockType["leftContent"], side: "left" | "right") => {
    if (content.contentType === "text" && content.text) {
      return <RichText content={content.text} />;
    }

    if (content.contentType === "media") {
      const imageUrl = getImageUrl(content.image, cmsBaseUrl);
      const videoEmbed = getVideoEmbed(content.videoUrl);

      if (imageUrl) {
        const image = typeof content.image === "object" ? content.image : null;
        return (
          <img
            src={imageUrl}
            alt={image?.alt || ""}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        );
      }

      if (videoEmbed) {
        return (
          <div className="relative w-full aspect-video">
            <iframe
              src={videoEmbed.embedUrl}
              title={`${side} column video`}
              className="absolute inset-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    return null;
  };

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        <div
          className={cn(
            "grid gap-8 items-center",
            block.responsive?.stackMobile !== false && "grid-cols-1",
            ratioClass,
            block.responsive?.reverseOrder && "md:[&>*:first-child]:order-2",
          )}
          style={{ gap: block.responsive?.gap ?? 32 }}
        >
          <div>{renderColumn(block.leftContent, "left")}</div>
          <div>{renderColumn(block.rightContent, "right")}</div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// GALLERY BLOCK
// =============================================================================
function GalleryBlock({ block, cmsBaseUrl }: { block: GalleryBlockType; cmsBaseUrl: string }) {
  if (!block.images || block.images.length === 0) return null;

  const columnsClass = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 lg:grid-cols-4",
    masonry: "columns-2 lg:columns-3 xl:columns-4 space-y-4",
  }[block.layout || "3"];

  const isMasonry = block.layout === "masonry";

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        {(block.title || block.description) && (
          <div className="text-center mb-10">
            {block.title && (
              <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
            )}
            {block.description && (
              <div className="text-muted-foreground max-w-2xl mx-auto">
                <RichText content={block.description} />
              </div>
            )}
          </div>
        )}

        <div
          className={cn(isMasonry ? columnsClass : `grid ${columnsClass}`)}
          style={{ gap: !isMasonry ? (block.responsive?.gap ?? 16) : undefined }}
        >
          {block.images.map((item) => {
            const imageUrl = getImageUrl(item.image, cmsBaseUrl);
            if (!imageUrl) return null;

            const image = typeof item.image === "object" ? item.image : null;

            return (
              <figure key={item.id} className={cn(isMasonry && "break-inside-avoid mb-4")}>
                <img
                  src={imageUrl}
                  alt={item.alt || image?.alt || ""}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
                {item.caption && (
                  <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// THREE COLUMN CARD BLOCK
// =============================================================================
function ThreeColumnCardBlock({ block }: { block: ThreeColumnCardBlockType }) {
  if (!block.columns || block.columns.length === 0) return null;

  const columnsClass = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[block.responsive?.desktopColumns || "3"];

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        {(block.title || block.subtitle) && (
          <div className="text-center mb-10">
            {block.title && (
              <h2 className="text-3xl font-bold tracking-tight mb-2">{block.title}</h2>
            )}
            {block.subtitle && <p className="text-lg text-muted-foreground">{block.subtitle}</p>}
          </div>
        )}

        <div
          className={cn("grid", columnsClass)}
          style={{ gap: block.responsive?.gapDesktop ?? 24 }}
        >
          {block.columns.map((column) => (
            <div key={column.id} className="bg-card rounded-lg border p-6 shadow-sm">
              {column.columnTitle && (
                <h3 className="text-xl font-semibold mb-4 pb-4 border-b">{column.columnTitle}</h3>
              )}
              {column.rows && column.rows.length > 0 && (
                <div className="space-y-4">
                  {column.rows.map((row) => (
                    <div key={row.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-medium">{row.label}</div>
                        {row.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <RichText content={row.description} />
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-right">{row.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CALCULATOR BLOCK
// =============================================================================
function CalculatorBlock({ block }: { block: CalculatorBlockType }) {
  const [amount, setAmount] = useState(1000);
  const [donors, setDonors] = useState(10);

  const transactionFee = block.feeConfiguration.transactionFeePercentage / 100;
  const platformFee = (block.feeConfiguration.donorContributionPercentage || 0) / 100;

  const totalFees = amount * (transactionFee + platformFee);
  const netAmount = amount - totalFees;
  const avgDonation = donors > 0 ? amount / donors : 0;

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
            {block.description && (
              <div className="text-muted-foreground">
                <RichText content={block.description} />
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="amount" className="mb-2 block">
                  Total Amount Raised
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="donors" className="mb-2 block">
                  Number of Donors
                </Label>
                <Input
                  id="donors"
                  type="number"
                  value={donors}
                  onChange={(e) => setDonors(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Transaction Fees ({block.feeConfiguration.transactionFeePercentage}%)
                </span>
                <span className="font-medium">{(amount * transactionFee).toFixed(2)}</span>
              </div>
              {platformFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Platform Fee ({block.feeConfiguration.donorContributionPercentage}%)
                  </span>
                  <span className="font-medium">{(amount * platformFee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-3">
                <span>Net Amount</span>
                <span className="text-primary">{netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Average Donation</span>
                <span>{avgDonation.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {block.examples && block.examples.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Examples</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {block.examples.map((example) => (
                  <button
                    type="button"
                    key={example.id}
                    className="p-4 border rounded-lg text-left hover:bg-muted transition-colors"
                    onClick={() => {
                      setAmount(example.totalRaised);
                      setDonors(example.numberOfDonors);
                    }}
                  >
                    <div className="font-semibold">{example.totalRaised.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {example.numberOfDonors} donors
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CONTACT FORM BLOCK
// =============================================================================
function ContactFormBlock({ block }: { block: ContactFormBlockType }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const maxWidthClass = {
    full: "max-w-none",
    large: "max-w-4xl",
    medium: "max-w-2xl",
    small: "max-w-xl",
  }[block.maxWidth || "medium"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission - replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
        <div className="container px-4">
          <div className={cn(maxWidthClass, "mx-auto text-center")}>
            <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-6 rounded-lg">
              {block.successMessage || "Thank you! Your message has been sent."}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4">
        <div className={cn(maxWidthClass, "mx-auto")}>
          {(block.title || block.description) && (
            <div className="text-center mb-8">
              {block.title && (
                <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
              )}
              {block.description && (
                <div className="text-muted-foreground">
                  <RichText content={block.description} />
                </div>
              )}
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              {block.errorMessage || "Something went wrong. Please try again."}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={cn("grid gap-4", block.layout === "two" && "md:grid-cols-2")}>
              {block.formFields?.map((field) => (
                <div key={field.id} className={cn(field.type === "textarea" && "md:col-span-2")}>
                  <Label htmlFor={field.name} className="mb-2 block">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder || undefined}
                      required={field.required || false}
                      rows={field.rows || 4}
                    />
                  ) : field.type === "select" ? (
                    <Select name={field.name} required={field.required || false}>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        required={field.required || false}
                      />
                      <Label htmlFor={field.name} className="text-sm font-normal">
                        {field.placeholder}
                      </Label>
                    </div>
                  ) : field.type === "radio" && field.options ? (
                    <RadioGroup name={field.name} required={field.required || false}>
                      {field.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <RadioGroupItem
                            value={option.value}
                            id={`${field.name}-${option.value}`}
                          />
                          <Label htmlFor={`${field.name}-${option.value}`} className="font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder || undefined}
                      required={field.required || false}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? "Sending..." : block.submitButtonText || "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
