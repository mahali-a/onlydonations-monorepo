import type { RichTextBlock as RichTextBlockType } from "@repo/types/payload";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";

export function RichTextBlock({ block }: { block: RichTextBlockType }) {
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
      className="pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] md:pt-[var(--pt-tablet)] md:pb-[var(--pb-tablet)] lg:pt-[var(--pt-desktop)] lg:pb-[var(--pb-desktop)]"
      style={
        {
          "--pt-mobile": `${block.spacing?.topMobile ?? 16}px`,
          "--pb-mobile": `${block.spacing?.bottomMobile ?? 16}px`,
          "--pt-tablet": `${block.spacing?.topTablet ?? 24}px`,
          "--pb-tablet": `${block.spacing?.bottomTablet ?? 24}px`,
          "--pt-desktop": `${block.spacing?.topDesktop ?? 32}px`,
          "--pb-desktop": `${block.spacing?.bottomDesktop ?? 32}px`,
        } as React.CSSProperties
      }
    >
      <div className="container px-4 mx-auto">
        <div className={cn(maxWidthClass, alignmentClass)}>
          <RichText content={block.content} />
        </div>
      </div>
    </section>
  );
}
