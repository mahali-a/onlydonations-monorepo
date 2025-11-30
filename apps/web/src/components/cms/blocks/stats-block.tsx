import type { StatsBlock as StatsBlockType } from "@repo/types/payload";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass, getImageUrl } from "../utils";

export function StatsBlock({ block, cmsBaseUrl }: { block: StatsBlockType; cmsBaseUrl: string }) {
  const columnsClass = {
    "2": "grid-cols-2",
    "3": "grid-cols-2 md:grid-cols-3",
    "4": "grid-cols-2 md:grid-cols-4",
  }[block.layout || "4"];

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
