import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import type { HeroBlock as HeroBlockType } from "@repo/types/payload";

export function HeroBlock({ block }: { block: HeroBlockType }) {
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
