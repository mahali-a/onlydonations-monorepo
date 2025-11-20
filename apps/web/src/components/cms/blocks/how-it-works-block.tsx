import { HowItWorksSection } from "@/features/home/ui";
import type { HowItWorksBlock as HowItWorksBlockType } from "@repo/types/payload";

export function HowItWorksBlock({ block }: { block: HowItWorksBlockType }) {
    return (
        <HowItWorksSection
            title={block.title}
            ctaText={block.ctaText}
            onCtaClick={() => {
                if (block.ctaLink) {
                    window.location.href = block.ctaLink;
                }
            }}
        />
    );
}
