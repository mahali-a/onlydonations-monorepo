import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDonationAmount } from "@/features/dashboard/dashboard-utils";
import type { CampaignPerformance as CampaignPerformanceType } from "@/features/dashboard/dashboard-models";

type CampaignPerformanceProps = {
  campaigns: CampaignPerformanceType[];
};

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Top Campaigns</h2>

        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No active campaigns yet. Create your first campaign to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const percentage =
                campaign.goal > 0 ? (campaign.totalRaised / campaign.goal) * 100 : 0;
              const displayPercentage = Math.min(percentage, 100);

              return (
                <div key={campaign.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.donationCount} donation{campaign.donationCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${displayPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {formatDonationAmount(campaign.totalRaised)} /{" "}
                      {formatDonationAmount(campaign.goal)} {campaign.currency}
                    </span>
                    <span className="font-semibold">{displayPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
