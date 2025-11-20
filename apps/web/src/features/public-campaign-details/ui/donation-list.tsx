import { formatCurrency } from "@/lib/money";
import type { PublicDonation } from "../public-campaign-details-models";
import { Heart } from "lucide-react";

type DonationListProps = {
  donations: PublicDonation[];
};

export function DonationList({ donations }: DonationListProps) {
  if (donations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heart className="h-12 w-12 text-muted mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No donations yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Be the first to support this campaign and make a difference!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {donation.isAnonymous ? "?" : donation.donorName?.charAt(0)?.toUpperCase() || "D"}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <p className="font-semibold text-foreground">
                {donation.isAnonymous ? "Anonymous" : donation.donorName}
              </p>
              <p className="font-bold text-primary flex-shrink-0">
                {formatCurrency(donation.amount, donation.currency)}
              </p>
            </div>

            {donation.donorMessage && (
              <p className="text-sm text-foreground mb-2 line-clamp-3">{donation.donorMessage}</p>
            )}

            <p className="text-xs text-muted-foreground">
              {new Date(donation.createdAt).toLocaleDateString("en-GH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
