"use client";

import type { FundraiserExamplesBlock as FundraiserExamplesBlockType } from "@repo/types/payload";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Money } from "@/lib/money";
import { retrieveCampaignsByIdsFromServer } from "./fundraiser-examples-actions";

export function FundraiserExamplesBlock({ block }: { block: FundraiserExamplesBlockType }) {
  const campaignIds = block.campaignIds?.map((item) => item.campaignId).filter(Boolean) || [];

  const { data: fetchedFundraisers = [], isLoading } = useQuery({
    queryKey: ["fundraiser-examples", campaignIds],
    queryFn: () => retrieveCampaignsByIdsFromServer({ data: { campaignIds } }),
    enabled: campaignIds.length > 0,
  });

  // Fallback mock data for showcase/demo when no real campaigns exist
  const mockFundraisers =
    block.campaignIds?.map((item, index) => ({
      id: item.campaignId || `campaign-${index}`,
      slug: `campaign-${index}`,
      beneficiaryName: `Campaign ${index + 1}`,
      title: `Fundraiser Title ${index + 1}`,
      description:
        "This is a sample fundraiser description. In production, this will show real campaign details from your database.",
      totalRaised: 1000000, // 10,000.00 in pesewas
      amount: 2500000, // 25,000.00 in pesewas
      currency: "GHS" as const,
      coverImage:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
    })) || [];

  // Use fetched data if available, otherwise use mock data
  const fundraisers = fetchedFundraisers.length > 0 ? fetchedFundraisers : mockFundraisers;

  const [activeTab, setActiveTab] = useState<string>("");

  // Set initial active tab when data loads
  useEffect(() => {
    if (fundraisers.length > 0 && !activeTab) {
      setActiveTab(fundraisers[0]?.id || "");
    }
  }, [fundraisers, activeTab]);

  const activeFundraiser = fundraisers.find((f) => f.id === activeTab) || fundraisers[0];
  const progressPercentage = activeFundraiser
    ? Math.min((activeFundraiser.totalRaised / activeFundraiser.amount) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2a2e30]">
            {block.title}
          </h2>
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!fundraisers || fundraisers.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2a2e30]">
          {block.title}
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {fundraisers.map((fundraiser: { id: string; beneficiaryName: string | null }) => (
            <button
              key={fundraiser.id}
              type="button"
              onClick={() => setActiveTab(fundraiser.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === fundraiser.id
                  ? "bg-[#2a2e30] text-white"
                  : "bg-transparent text-[#6b6b6b] hover:bg-gray-100"
              }`}
            >
              {fundraiser.beneficiaryName}
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
                  src={
                    activeFundraiser.coverImage ||
                    "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                  }
                  alt={activeFundraiser.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-[#2a2e30] leading-tight">
                  {activeFundraiser.title}
                </h3>
                <p className="text-[#5a5a5a] leading-relaxed mb-8 text-base md:text-lg line-clamp-4">
                  {/* Strip HTML tags for plain text preview */}
                  {activeFundraiser.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()}
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
                    {Money.fromMinor(
                      activeFundraiser.totalRaised,
                      activeFundraiser.currency,
                    ).format()}{" "}
                    raised of{" "}
                    {Money.fromMinor(activeFundraiser.amount, activeFundraiser.currency).format()}{" "}
                    goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {block.ctaText && block.ctaLink && (
          <div className="text-center mt-12">
            <Link
              to={block.ctaLink}
              className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 shadow-sm"
            >
              {block.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
