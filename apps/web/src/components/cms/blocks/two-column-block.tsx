import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getBgColorClass, getImageUrl, getVideoEmbed } from "../utils";
import type { TwoColumnBlock as TwoColumnBlockType } from "@repo/types/payload";

export function TwoColumnBlock({ block, cmsBaseUrl }: { block: TwoColumnBlockType; cmsBaseUrl: string }) {
    const ratioClass = {
        "50-50": "md:grid-cols-2",
        "60-40": "md:grid-cols-[3fr_2fr]",
        "40-60": "md:grid-cols-[2fr_3fr]",
    }[block.responsive?.columnRatio || "50-50"];

    const renderColumn = (content: TwoColumnBlockType["leftContent"], side: "left" | "right") => {
        if (content.contentType === "text" && content.text) {
            return <RichText content={content.text} />;
        }

        if (content.contentType === "media") {
            const imageUrl = getImageUrl(content.image, cmsBaseUrl);
            const videoEmbed = getVideoEmbed(content.videoUrl);

            if (imageUrl) {
                const image = typeof content.image === "object" ? content.image : null;
                return (
                    <img
                        src={imageUrl}
                        alt={image?.alt || ""}
                        className="w-full h-auto rounded-lg"
                        loading="lazy"
                    />
                );
            }

            if (videoEmbed) {
                return (
                    <div className="relative w-full aspect-video">
                        <iframe
                            src={videoEmbed.embedUrl}
                            title={`${side} column video`}
                            className="absolute inset-0 w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <section className={cn("py-12 md:py-16", getBgColorClass(block.backgroundColor))}>
            <div className="container px-4">
                <div
                    className={cn(
                        "grid gap-8 items-center",
                        block.responsive?.stackMobile !== false && "grid-cols-1",
                        ratioClass,
                        block.responsive?.reverseOrder && "md:[&>*:first-child]:order-2",
                    )}
                    style={{ gap: block.responsive?.gap ?? 32 }}
                >
                    <div>{renderColumn(block.leftContent, "left")}</div>
                    <div>{renderColumn(block.rightContent, "right")}</div>
                </div>
            </div>
        </section>
    );
}
