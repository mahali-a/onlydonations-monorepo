import type { CTABlock as CTABlockType } from "@repo/types/payload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass } from "../utils";

export function CTABlock({ block }: { block: CTABlockType }) {
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
