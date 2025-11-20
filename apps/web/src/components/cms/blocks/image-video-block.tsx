import { useState } from "react";
import { cn } from "@/lib/utils";
import { getImageUrl, getVideoEmbed } from "../utils";
import type { ImageVideoBlock as ImageVideoBlockType, Media } from "@repo/types/payload";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function ImageVideoBlock({
    block,
    cmsBaseUrl,
}: {
    block: ImageVideoBlockType;
    cmsBaseUrl: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const widthClass = {
        full: "max-w-none",
        large: "max-w-6xl",
        medium: "max-w-4xl",
        small: "max-w-2xl",
    }[block.width || "full"];

    const alignmentClass = {
        left: "mr-auto text-left",
        center: "mx-auto text-center",
        right: "ml-auto text-right",
    }[block.alignment || "center"];

    const image = typeof block.image === "object" ? (block.image as Media) : null;
    const imageUrl = getImageUrl(image, cmsBaseUrl);
    const videoEmbed = getVideoEmbed(block.videoUrl);

    return (
        <section
            className="py-8 md:py-12 pt-[var(--pt-mobile)] pb-[var(--pb-mobile)] md:pt-[var(--pt-tablet)] md:pb-[var(--pb-tablet)] lg:pt-[var(--pt-desktop)] lg:pb-[var(--pb-desktop)]"
            style={
                {
                    "--pt-mobile": `${block.spacing?.topMobile ?? 16}px`,
                    "--pb-mobile": `${block.spacing?.bottomMobile ?? 16}px`,
                    "--pt-tablet": `${block.spacing?.topTablet ?? 24}px`,
                    "--pb-tablet": `${block.spacing?.bottomTablet ?? 24}px`,
                    "--pt-desktop": `${block.spacing?.topDesktop ?? 32}px`,
                    "--pb-desktop": `${block.spacing?.bottomDesktop ?? 32}px`,
                } as React.CSSProperties
            }
        >
            <div className="container px-4">
                <figure className={cn(widthClass, alignmentClass)}>
                    {block.mediaType === "image" && imageUrl && (
                        <>
                            <button
                                type="button"
                                className="w-full block cursor-zoom-in transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                                onClick={() => setIsOpen(true)}
                            >
                                <img
                                    src={imageUrl}
                                    alt={block.altText || image?.alt || ""}
                                    width={image?.width || undefined}
                                    height={image?.height || undefined}
                                    className="w-full h-auto rounded-lg"
                                    loading="lazy"
                                />
                            </button>

                            <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
                                <DialogPrimitive.Portal>
                                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                                    <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 focus:outline-none">
                                        <VisuallyHidden.Root>
                                            <DialogTitle>Image Preview</DialogTitle>
                                        </VisuallyHidden.Root>

                                        <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsOpen(false)}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-0 right-0 z-50 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <X className="h-6 w-6 sm:h-7 sm:w-7" />
                                                <span className="sr-only">Close</span>
                                            </Button>

                                            <img
                                                src={imageUrl}
                                                alt={block.altText || image?.alt || ""}
                                                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-md shadow-2xl select-none"
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            {block.caption && (
                                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                                    <div className="inline-block bg-black/70 text-white/90 px-4 py-2.5 rounded-xl text-sm sm:text-base backdrop-blur-md max-w-[90vw]">
                                                        {block.caption}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogPrimitive.Content>
                                </DialogPrimitive.Portal>
                            </DialogPrimitive.Root>
                        </>
                    )}

                    {block.mediaType === "video" && videoEmbed && (
                        <div className="relative w-full aspect-video">
                            <iframe
                                src={videoEmbed.embedUrl}
                                title={block.caption || "Video"}
                                className="absolute inset-0 w-full h-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {block.caption && (
                        <figcaption className="mt-3 text-sm text-muted-foreground">{block.caption}</figcaption>
                    )}
                </figure>
            </div>
        </section>
    );
}
