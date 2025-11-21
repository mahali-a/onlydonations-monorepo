import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { GalleryBlock as GalleryBlockType } from "@repo/types/payload";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RichText } from "../rich-text";
import { getImageUrl } from "../utils";

export function GalleryBlock({
  block,
  cmsBaseUrl,
}: {
  block: GalleryBlockType;
  cmsBaseUrl: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!block.images || block.images.length === 0) return null;

  const columnsClass = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 lg:grid-cols-4",
    masonry: "columns-2 lg:columns-3 xl:columns-4 space-y-4",
  }[block.layout || "3"];

  const isMasonry = block.layout === "masonry";

  const handleNext = () => {
    if (selectedIndex === null || !block.images) return;
    const images = block.images;
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
  };

  const handlePrev = () => {
    if (selectedIndex === null || !block.images) return;
    const images = block.images;
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
  };

  const selectedImage = selectedIndex !== null && block.images ? block.images[selectedIndex] : null;
  const selectedImageUrl = selectedImage ? getImageUrl(selectedImage.image, cmsBaseUrl) : null;
  const selectedImageAlt =
    selectedImage && typeof selectedImage.image === "object"
      ? selectedImage.image.alt
      : selectedImage?.alt || "";

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
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

        <div
          className={cn(isMasonry ? columnsClass : `grid ${columnsClass}`)}
          style={{ gap: !isMasonry ? (block.responsive?.gap ?? 16) : undefined }}
        >
          {block.images.map((item, index) => {
            const imageUrl = getImageUrl(item.image, cmsBaseUrl);
            if (!imageUrl) return null;

            const image = typeof item.image === "object" ? item.image : null;

            return (
              <figure key={item.id} className={cn(isMasonry && "break-inside-avoid mb-4")}>
                <button
                  type="button"
                  className="w-full block cursor-zoom-in transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={imageUrl}
                    alt={item.alt || image?.alt || ""}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </button>
                {item.caption && (
                  <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>

      <DialogPrimitive.Root
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 focus:outline-none">
            <VisuallyHidden.Root>
              <DialogTitle>Image Preview</DialogTitle>
            </VisuallyHidden.Root>

            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={() => setSelectedIndex(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSelectedIndex(null);
              }}
              role="button"
              tabIndex={0}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 z-50 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
              >
                <X className="h-6 w-6 sm:h-7 sm:w-7" />
                <span className="sr-only">Close</span>
              </Button>

              {/* Navigation Buttons */}
              {block.images && block.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-12 w-12 sm:h-14 sm:w-14 transition-colors hidden sm:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                  >
                    <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="sr-only">Previous image</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-12 w-12 sm:h-14 sm:w-14 transition-colors hidden sm:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  >
                    <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
                    <span className="sr-only">Next image</span>
                  </Button>

                  {/* Mobile Navigation Zones (invisible but clickable) */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1/4 z-40 sm:hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") {
                        e.stopPropagation();
                        handlePrev();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Previous image"
                  />
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/4 z-40 sm:hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") {
                        e.stopPropagation();
                        handleNext();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Next image"
                  />
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-50 text-white/90 bg-black/20 hover:bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium select-none transition-colors">
                {selectedIndex !== null ? selectedIndex + 1 : 0} / {block.images.length}
              </div>

              {selectedImageUrl && (
                <button
                  type="button"
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                    }
                  }}
                >
                  <img
                    src={selectedImageUrl}
                    alt={selectedImageAlt}
                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-md shadow-2xl select-none"
                  />
                </button>
              )}

              {/* Caption overlay */}
              {selectedImage?.caption && (
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                  <div className="inline-block bg-black/70 text-white/90 px-4 py-2.5 rounded-xl text-sm sm:text-base backdrop-blur-md max-w-[90vw]">
                    {selectedImage.caption}
                  </div>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
