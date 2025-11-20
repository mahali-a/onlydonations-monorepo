import { useState } from "react";
import type { Fundraiser } from "./types";

interface FundraiserExamplesSectionProps {
    title: string;
    fundraisers: Fundraiser[];
    ctaText?: string;
    onCtaClick?: () => void;
}

export function FundraiserExamplesSection({
    title,
    fundraisers,
    ctaText,
    onCtaClick,
}: FundraiserExamplesSectionProps) {
    const [activeTab, setActiveTab] = useState(fundraisers[0]?.id ?? "");

    const activeFundraiser = fundraisers.find((f) => f.id === activeTab) || fundraisers[0];
    const progressPercentage = activeFundraiser
        ? Math.min((activeFundraiser.raised / activeFundraiser.goal) * 100, 100)
        : 0;

    return (
        <section className="bg-white py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2a2e30]">
                    {title}
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {fundraisers.map((fundraiser) => (
                        <button
                            key={fundraiser.id}
                            type="button"
                            onClick={() => setActiveTab(fundraiser.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === fundraiser.id
                                    ? "bg-[#2a2e30] text-white"
                                    : "bg-transparent text-[#6b6b6b] hover:bg-gray-100"
                                }`}
                        >
                            {fundraiser.name}
                        </button>
                    ))}
                </div>

                {/* Fundraiser Card */}
                {activeFundraiser && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Image */}
                            <div className="relative aspect-[4/3] md:aspect-auto">
                                <img
                                    src={activeFundraiser.imageUrl}
                                    alt={activeFundraiser.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#2a2e30] leading-tight">
                                    {activeFundraiser.title}
                                </h3>
                                <p className="text-[#5a5a5a] leading-relaxed mb-8 text-base md:text-lg">
                                    {activeFundraiser.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mt-auto">
                                    <div className="mb-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-[#2a2e30]">
                                        ${activeFundraiser.raised.toLocaleString()}.00 raised of $
                                        {activeFundraiser.goal.toLocaleString()}.00 goal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {ctaText && (
                    <div className="text-center mt-12">
                        <button
                            type="button"
                            onClick={onCtaClick}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-sm"
                        >
                            {ctaText}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
