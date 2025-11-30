import type { ThreeColumnCardBlock as ThreeColumnCardBlockType } from "@repo/types/payload";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass } from "../utils";

export function ThreeColumnCardBlock({ block }: { block: ThreeColumnCardBlockType }) {
  if (!block.columns || block.columns.length === 0) return null;

  const columnsClass = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[block.responsive?.desktopColumns || "3"];

  return (
    <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
      <div className="container px-4 mx-auto">
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
