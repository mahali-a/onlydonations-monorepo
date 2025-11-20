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
      <section className="bg-[#f3f1eb] flex items-center justify-center p-4 lg:p-8 min-h-[600px] lg:min-h-[700px]">
        <div className="max-w-6xl w-full mx-auto relative">
          {/* Image Container - Positioned to the right */}
          <div className="lg:w-[65%] lg:ml-auto">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
              <img
                src={imageUrl || ""}
                alt={block.imageAlt}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Content Card - Overlapping from the left */}
          <div className="relative mt-[-4rem] lg:mt-0 lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[55%]">
            <div className="bg-white rounded-4xl p-8 lg:p-12 shadow-sm">
              <h1 className="text-3xl lg:text-[2.75rem] font-bold leading-[1.1] text-[#1a1a1a] mb-6 font-serif tracking-tight">
                {block.title}
              </h1>
              <p className="text-[#4a4a4a] text-xl leading-relaxed mb-8">{block.description}</p>
              <button
                type="button"
                onClick={() => {
                  if (block.ctaLink) {
                    window.location.href = block.ctaLink;
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 text-sm"
              >
                {block.ctaText}
              </button>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
