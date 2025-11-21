import type { DividerBlock as DividerBlockType } from "@repo/types/payload";
import { cn } from "@/lib/utils";

export function DividerBlock({ block }: { block: DividerBlockType }) {
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
      className="pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] md:pt-[var(--pt-tablet)] md:pb-[var(--pb-tablet)] lg:pt-[var(--pt-desktop)] lg:pb-[var(--pb-desktop)]"
      style={
        {
          "--pt-mobile": `${block.spacing?.topMobile ?? 16}px`,
          "--pb-mobile": `${block.spacing?.bottomMobile ?? 16}px`,
          "--pt-tablet": `${block.spacing?.topTablet ?? 16}px`,
          "--pb-tablet": `${block.spacing?.bottomTablet ?? 16}px`,
          "--pt-desktop": `${block.spacing?.topDesktop ?? 16}px`,
          "--pb-desktop": `${block.spacing?.bottomDesktop ?? 16}px`,
        } as React.CSSProperties
      }
    >
      <div className="container px-4">
        <hr className={cn(styleClass, colorClass)} />
      </div>
    </div>
  );
}
