import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, A11y, Mousewheel } from "swiper/modules";
import { IconCard } from "./icon-card";
import type { IconCardItem } from "./types";

// Import Swiper styles
// @ts-expect-error - CSS import
import "swiper/css";
// @ts-expect-error - CSS import
import "swiper/css/pagination";

interface IconCardsSectionProps {
    title: string;
    items: IconCardItem[];
    moreButtonText?: string;
    onMoreClick?: () => void;
}

export function IconCardsSection({ title, items, moreButtonText, onMoreClick }: IconCardsSectionProps) {
    return (
        <section className="bg-white py-20 overflow-hidden">
            <div className="max-w-[1250px] mx-auto px-6 lg:px-12">
                <div className="flex flex-row items-start gap-8 mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold max-w-2xl leading-[1.1] tracking-tight">
                        {title}
                    </h2>
                    {moreButtonText && (
                        <button
                            type="button"
                            onClick={onMoreClick}
                            className="border border-gray-300 rounded-full px-6 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors whitespace-nowrap mt-2"
                        >
                            {moreButtonText}
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
