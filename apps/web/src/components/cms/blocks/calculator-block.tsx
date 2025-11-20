import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichText } from "../rich-text";
import type { CalculatorBlock as CalculatorBlockType } from "@repo/types/payload";

export function CalculatorBlock({ block }: { block: CalculatorBlockType }) {
    const [amount, setAmount] = useState(1000);
    const [donors, setDonors] = useState(10);

    const transactionFee = block.feeConfiguration.transactionFeePercentage / 100;
    const platformFee = (block.feeConfiguration.donorContributionPercentage || 0) / 100;

    const totalFees = amount * (transactionFee + platformFee);
    const netAmount = amount - totalFees;
    const avgDonation = donors > 0 ? amount / donors : 0;

    return (
        <section className="py-12 md:py-16">
            <div className="container px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
                        {block.description && (
                            <div className="text-muted-foreground">
                                <RichText content={block.description} />
                            </div>
                        )}
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Label htmlFor="amount" className="mb-2 block">
                                    Total Amount Raised
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    min={0}
                                />
                            </div>
                            <div>
                                <Label htmlFor="donors" className="mb-2 block">
                                    Number of Donors
                                </Label>
                                <Input
                                    id="donors"
                                    type="number"
                                    value={donors}
                                    onChange={(e) => setDonors(Number(e.target.value))}
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Transaction Fees ({block.feeConfiguration.transactionFeePercentage}%)
                                </span>
                                <span className="font-medium">{(amount * transactionFee).toFixed(2)}</span>
                            </div>
                            {platformFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Platform Fee ({block.feeConfiguration.donorContributionPercentage}%)
                                    </span>
                                    <span className="font-medium">{(amount * platformFee).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-semibold border-t pt-3">
                                <span>Net Amount</span>
                                <span className="text-primary">{netAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Average Donation</span>
                                <span>{avgDonation.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {block.examples && block.examples.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Examples</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                {block.examples.map((example) => (
                                    <button
                                        type="button"
                                        key={example.id}
                                        className="p-4 border rounded-lg text-left hover:bg-muted transition-colors"
                                        onClick={() => {
                                            setAmount(example.totalRaised);
                                            setDonors(example.numberOfDonors);
                                        }}
                                    >
                                        <div className="font-semibold">{example.totalRaised.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {example.numberOfDonors} donors
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
