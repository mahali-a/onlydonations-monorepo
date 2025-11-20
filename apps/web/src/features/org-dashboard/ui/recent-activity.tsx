import { Card } from "@/components/ui/card";
import { formatForDashboard } from "@/lib/money";
import { formatDashboardDate } from "@/lib/utils/dashboard-utils";
import type { RecentDonation } from "@/features/org-dashboard/org-dashboard-models";

type RecentActivityProps = {
  donations: RecentDonation[];
};

export function RecentActivity({ donations }: RecentActivityProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Donations</h2>

        {donations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No donations yet. Share your campaigns to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-start justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {donation.isAnonymous ? "Anonymous Donor" : donation.donorName || "Donor"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {donation.campaignTitle || "Campaign"} •{" "}
                    {formatDashboardDate(donation.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatForDashboard(donation.amount, donation.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
