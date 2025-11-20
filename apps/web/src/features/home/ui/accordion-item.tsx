import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface AccordionItemProps {
    question: string;
    answer: string;
    defaultOpen?: boolean;
}

export function AccordionItem({ question, answer, defaultOpen = false }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-300 last:border-b-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-start gap-4 py-6 text-left hover:opacity-70 transition-opacity duration-200 group"
            >
                <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 flex items-center justify-center transition-transform duration-300">
                        {isOpen ? (
                            <Minus
                                size={20}
                                className="text-primary transition-all duration-300"
                                strokeWidth={2.5}
                            />
                        ) : (
                            <Plus
                                size={20}
                                className="text-primary transition-all duration-300"
                                strokeWidth={2.5}
                            />
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-[#2a2e30] leading-relaxed pr-4">
                        {question}
                    </h3>
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="pl-9 pr-4 pb-6">
                    <p className="text-[15px] text-[#5a5a5a] leading-relaxed">{answer}</p>
                </div>
            </div>
        </div>
    );
}
