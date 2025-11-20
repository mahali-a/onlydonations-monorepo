import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import type { PricingBlock as PricingBlockType } from "@repo/types/payload";

interface PricingBlockProps {
  block: PricingBlockType;
  contactEmail?: string;
}

export function PricingBlock({ block, contactEmail }: PricingBlockProps) {
  const [amount, setAmount] = useState(block.calculatorDefaultAmount || 10000);

  // Use block's contact email if provided, otherwise fall back to Settings email
  const displayEmail = block.contactEmail || contactEmail || "support@onlydonations.com";

  // Calculate fees based on block percentages
  const platformFeePercentage = block.fundraisingFee.percentage / 100;

  const platformFee = amount * platformFeePercentage;
  const youReceive = amount - platformFee;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{block.title}</h1>
            {block.subtitle && (
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {block.subtitle} Questions? Reach out to us at{" "}
                <a href={`mailto:${displayEmail}`} className="text-primary hover:underline">
                  {displayEmail}
                </a>
                .
              </p>
            )}
          </div>

          {/* Fee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {/* Donor Fee Card */}
            <Card className="bg-accent border-accent-foreground/10">
              <CardHeader>
                <CardTitle className="text-xl">{block.donorFee.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {block.donorFee.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{block.donorFee.percentage}%</span>
                    <span className="text-sm text-muted-foreground">/ each donation.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fundraising Fee Card */}
            <Card className="bg-primary text-primary-foreground border-primary">
              <CardHeader>
                <CardTitle className="text-xl text-primary-foreground">
                  {block.fundraisingFee.title}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {block.fundraisingFee.description}
                  {block.fundraisingFee.learnMoreLink && (
                    <>
                      {" "}
                      <a
                        href={block.fundraisingFee.learnMoreLink}
                        className="text-primary-foreground hover:underline"
                      >
                        Read more on why we charge fees here
                      </a>
                      .
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 flex">
                  <div className="text-6xl font-bold">{block.fundraisingFee.percentage}%</div>
                  <span className="text-sm text-primary-foreground/80">/ amount raised</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculator Section */}
          {block.showCalculator && (
            <div className="bg-secondary text-secondary-foreground rounded-lg p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Calculator</h3>

                {/* Single line input */}
                <div className="flex items-center gap-3 text-md flex-wrap">
                  <span className="">If you raise</span>
                  <div className="inline-flex items-baseline gap-1 min-w-0">
                    <span className="text-2xl font-bold">₵</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      className="bg-transparent border-b-2 border-secondary-foreground/30 focus:border-secondary-foreground outline-none text-left text-4xl font-bold w-auto min-w-[120px] max-w-[300px] transition-colors px-2"
                      placeholder="10000"
                    />
                  </div>
                  <span className="font-normal">from donors, you receive</span>
                  <span className="text-4xl font-bold whitespace-nowrap">
                    ₵
                    {youReceive.toLocaleString("en-GH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Service fee below */}
                <div className="">
                  <span className="text-base text-secondary-foreground/80">
                    Platform fee ({block.fundraisingFee.percentage}%):{" "}
                    <span className="font-semibold text-lg">
                      ₵
                      {platformFee.toLocaleString("en-GH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
