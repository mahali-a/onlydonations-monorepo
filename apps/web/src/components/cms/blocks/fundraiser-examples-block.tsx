import { FundraiserExamplesSection } from "@/features/home/ui";
import type { FundraiserExamplesBlock as FundraiserExamplesBlockType } from "@repo/types/payload";

// Note: This will be updated to fetch campaigns via server function
// For now using hardcoded data as placeholder
export function FundraiserExamplesBlock({
    block,
}: { block: FundraiserExamplesBlockType }) {
    // TODO: Fetch campaign details using campaignIds from block.campaignIds
    // For now, using placeholder data
    const fundraisers =
        block.campaignIds?.map((item, index) => ({
            id: item.campaignId || `campaign-${index}`,
            name: `Campaign ${index + 1}`,
            title: `Campaign Title ${index + 1}`,
            description: "Campaign description will be fetched from server",
            raised: 10000,
            goal: 25000,
            imageUrl:
                "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
        })) || [];

    return (
        <FundraiserExamplesSection
            title={block.title}
            fundraisers={fundraisers}
            ctaText={block.ctaText || undefined}
            onCtaClick={
                block.ctaLink
                    ? () => {
                        window.location.href = block.ctaLink || "";
                    }
                    : undefined
            }
        />
    );
}
