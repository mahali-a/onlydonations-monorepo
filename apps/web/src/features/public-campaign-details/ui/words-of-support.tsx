import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { donationsWithMessagesQueryOptions } from "../server";
import { DonationItem } from "./donation-item";

type WordsOfSupportProps = {
  campaignId: string;
};

function WordsOfSupportContent({ campaignId }: WordsOfSupportProps) {
  const { data: donations } = useSuspenseQuery(donationsWithMessagesQueryOptions(campaignId));

  if (donations.length === 0) {
    return (
      <div className="space-y-4 pt-8">
        <h3 className="text-xl font-bold">Words of support</h3>
        <p className="text-muted-foreground">
          No messages yet. Be the first to leave words of encouragement!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-8">
      <h3 className="text-xl font-bold">Words of support ({donations.length})</h3>
      <ul className="space-y-4">
        {donations.map((donation) => (
          <DonationItem key={donation.id} donation={donation} showMessage />
        ))}
      </ul>
    </div>
  );
}

function WordsOfSupportLoading() {
  return (
    <div className="space-y-4 pt-8">
      <h3 className="text-xl font-bold">Words of support</h3>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => `support-skeleton-${i}`).map((key) => (
          <div key={key} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WordsOfSupport({ campaignId }: WordsOfSupportProps) {
  return (
    <Suspense fallback={<WordsOfSupportLoading />}>
      <WordsOfSupportContent campaignId={campaignId} />
    </Suspense>
  );
}
