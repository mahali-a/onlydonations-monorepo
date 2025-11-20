import { AccordionItem } from "./accordion-item";
import type { FaqItem } from "./types";

interface FaqSectionProps {
    title: string;
    faqs: FaqItem[];
    moreButtonText?: string;
    onMoreClick?: () => void;
}

export function FaqSection({ title, faqs, moreButtonText, onMoreClick }: FaqSectionProps) {
    return (
        <section className="bg-[#f3f1eb] py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#2a2e30] leading-tight">
                        {title}
                    </h2>
                    {moreButtonText && (
                        <button
                            type="button"
                            onClick={onMoreClick}
                            className="border border-gray-300 rounded-full px-5 py-2 text-sm font-bold hover:bg-white/50 transition-all duration-200 whitespace-nowrap self-start md:self-auto md:mt-1"
                        >
                            {moreButtonText}
                        </button>
                    )}
                </div>

                <div className="space-y-0 bg-[#f3f1eb]">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            defaultOpen={index === 0}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
