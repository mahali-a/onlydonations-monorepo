import type { FeatureHighlightBlock as FeatureHighlightBlockType } from "@repo/types/payload";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass, getImageUrl } from "../utils";

export function FeatureHighlightBlock({
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
      <div className="container px-4 mx-auto">
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
