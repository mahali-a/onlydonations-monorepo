import { HeroSection } from "@/features/home/ui";
import type { HeroOverlappingBlock as HeroOverlappingBlockType } from "@repo/types/payload";
import { getImageUrl } from "../utils";

export function HeroOverlappingBlock({
    block,
    cmsBaseUrl,
}: {
    block: HeroOverlappingBlockType;
    cmsBaseUrl: string;
}) {
    const bgClass =
        block.backgroundColor === "beige"
            ? "bg-[#f3f1eb]"
            : block.backgroundColor === "gray-light"
                ? "bg-muted"
                : "bg-background";

    const imageUrl = getImageUrl(block.imageUrl as any, cmsBaseUrl);

    return (
        <section className={bgClass}>
            <HeroSection
                content={{
                    title: block.title,
                    description: block.description,
                    ctaText: block.ctaText,
                    imageUrl: imageUrl || "",
                    imageAlt: block.imageAlt,
                }}
                onCtaClick={() => {
                    if (block.ctaLink) {
                        window.location.href = block.ctaLink;
                    }
                }}
            />
        </section>
    );
}
