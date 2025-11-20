import type { IconCardsBlock as IconCardsBlockType } from "@repo/types/payload";
import type { LucideIcon } from "lucide-react";
import { Calendar, Check, Heart, Info, Lightbulb, Quote, Share2, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, A11y, Mousewheel } from "swiper/modules";

// Import Swiper styles
// @ts-expect-error - CSS import
import "swiper/css";
// @ts-expect-error - CSS import
import "swiper/css/pagination";

interface IconCardItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function IconCard({ icon, title, description }: IconCardProps) {
  return (
    <div className="bg-[#f3f1eb] rounded-3xl p-10 md:p-12 flex flex-col snap-start h-full">
      <div className="mb-8">{icon}</div>
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#2a2e30] tracking-tight">{title}</h3>
      <p className="text-[#4a4a4a] leading-relaxed text-lg md:text-[1.15rem]">{description}</p>
    </div>
  );
}

export function IconCardsBlock({ block }: { block: IconCardsBlockType }) {
  const iconMap: Record<string, LucideIcon> = {
    quote: Quote,
    calendar: Calendar,
    heart: Heart,
    share: Share2,
    star: Star,
    check: Check,
    info: Info,
    lightbulb: Lightbulb,
  };

  const items: IconCardItem[] =
    block.items?.map((item) => ({
      id: item.id || "",
      icon: iconMap[item.iconName] || Quote,
      title: item.title,
      description: item.description,
    })) || [];

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-[1250px] mx-auto px-6 lg:px-12">
        <div className="flex flex-row items-start gap-8 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold max-w-2xl leading-[1.1] tracking-tight">
            {block.title}
          </h2>
          {block.moreButtonText && (
            <button
              type="button"
              onClick={() => {
                if (block.moreButtonLink) {
                  window.location.href = block.moreButtonLink;
                }
              }}
              className="border border-gray-300 rounded-full px-6 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors whitespace-nowrap mt-2"
            >
              {block.moreButtonText}
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <Swiper
          modules={[Pagination, Keyboard, A11y, Mousewheel]}
          spaceBetween={32}
          slidesPerView="auto"
          centeredSlides={false}
          keyboard={{ enabled: true }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          }}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1.1,
              spaceBetween: 24,
              centeredSlides: false,
            },
            768: {
              slidesPerView: "auto",
              spaceBetween: 32,
              centeredSlides: false,
            },
          }}
          className="!pl-6 lg:!pl-12 !pb-16 tips-swiper"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="!w-[85vw] md:!w-[552px]">
              <IconCard
                icon={<item.icon size={32} className="text-[#2a2e30]" />}
                title={item.title}
                description={item.description}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
