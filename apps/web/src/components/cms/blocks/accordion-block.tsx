import type { AccordionBlock as AccordionBlockType } from "@repo/types/payload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass, getImageUrl } from "../utils";

export function AccordionBlock({
  block,
  cmsBaseUrl,
}: {
  block: AccordionBlockType;
  cmsBaseUrl: string;
}) {
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
