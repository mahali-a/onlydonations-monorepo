import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import { Money } from "@/lib/money";
import type { DonationWithMessage } from "../public-campaign-details-models";

type DonationItemProps = {
  donation: DonationWithMessage;
  showMessage?: boolean;
  showTime?: boolean;
};

export function DonationItem({
  donation,
  showMessage = false,
  showTime = false,
}: DonationItemProps) {
  const displayName = donation.isAnonymous ? "Anonymous" : donation.donorName || "Anonymous";

  return (
    <li className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
        <Heart className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{displayName}</div>
          {showTime && donation.createdAt && (
            <span className="text-xs text-muted-foreground">
              • {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {Money.fromMinor(donation.amount, donation.currency).format()}
        </div>
        {showMessage && donation.donorMessage && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3 break-words">
            {donation.donorMessage}
          </p>
        )}
      </div>
    </li>
  );
}
