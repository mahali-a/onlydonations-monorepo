import { IconCardsSection } from "@/features/home/ui";
import type { IconCardsBlock as IconCardsBlockType } from "@repo/types/payload";
import {
    Calendar,
    Check,
    Heart,
    Info,
    Lightbulb,
    Quote,
    Share2,
    Star,
} from "lucide-react";

export function IconCardsBlock({ block }: { block: IconCardsBlockType }) {
    const iconMap: Record<string, any> = {
        quote: Quote,
        calendar: Calendar,
        heart: Heart,
        share: Share2,
        star: Star,
        check: Check,
        info: Info,
        lightbulb: Lightbulb,
    };

    const items =
        block.items?.map((item) => ({
            id: item.id || "",
            icon: iconMap[item.iconName] || Quote,
            title: item.title,
            description: item.description,
        })) || [];

    return (
        <IconCardsSection
            title={block.title}
            items={items}
            moreButtonText={block.moreButtonText || undefined}
            onMoreClick={
                block.moreButtonLink
                    ? () => {
                        window.location.href = block.moreButtonLink || "";
                    }
                    : undefined
            }
        />
    );
}
