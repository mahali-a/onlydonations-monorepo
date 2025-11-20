import { useState } from "react";
import type { FAQBlock as FAQBlockType } from "@repo/types/payload";

// =============================================================================
// FAQ BLOCK
// =============================================================================
export function FAQBlock({ block }: { block: FAQBlockType }) {
    if (!block.faqs || block.faqs.length === 0) return null;

    // Transform rich text answers to plain text
    const faqs = block.faqs.map((faq) => {
        // Extract plain text from rich text structure
        let answerText = "";
        if (faq.answer?.root?.children) {
            answerText = faq.answer.root.children
                .map((child: any) => {
                    if (child.children) {
                        return child.children.map((c: any) => c.text || "").join("");
                    }
                    return "";
                })
                .join("\n");
        }

        return {
            id: faq.id || "",
            question: faq.question,
            answer: answerText,
        };
    });

    // Render using the new FaqSection component style
    return (
        <section className="bg-white py-20">
            <div className="max-w-[1250px] mx-auto px-6 lg:px-12">
                {block.title && (
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">
                        {block.title}
                    </h2>
                )}
                <div className="space-y-0">
                    {faqs.map((faq) => (
                        <FaqAccordionItem key={faq.id} faq={faq} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Helper component for FAQ accordion item (matching new design)
function FaqAccordionItem({
    faq,
}: { faq: { id: string; question: string; answer: string } }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-start justify-between gap-6 text-left hover:opacity-70 transition-opacity"
            >
                <span className="text-xl md:text-2xl font-bold flex-1">
                    {faq.question}
                </span>
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {isOpen ? (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    ) : (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    )}
                </span>
            </button>
            {isOpen && (
                <div className="pb-8 pr-12">
                    <p className="text-lg text-[#4a4a4a] leading-relaxed">{faq.answer}</p>
                </div>
            )}
        </div>
    );
}
