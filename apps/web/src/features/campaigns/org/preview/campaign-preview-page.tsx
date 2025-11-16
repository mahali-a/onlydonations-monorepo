import type { CampaignDetailData } from "../../public/types";
import { CampaignDetailContent } from "../../public/ui/campaign-detail-content";

type CampaignPreviewPageProps = {
  data: CampaignDetailData;
};

export function CampaignPreviewPage({ data }: CampaignPreviewPageProps) {
  const { campaign } = data;

  const isDonateEnabled = campaign.status === "ACTIVE" && campaign.publishedAt !== null;

  return (
    <div className="min-h-screen bg-background">
      <CampaignDetailContent
        data={data}
        showPreviewBanner={true}
        isDonateEnabled={isDonateEnabled}
        showEmptyDonationsMessage={true}
      />
    </div>
  );
}
