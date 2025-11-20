import type { CampaignDetailData } from "../../public-campaign-details/public-campaign-details-models";
import { CampaignPreviewContent } from "./campaign-preview-content";
import { PreviewHeader } from "./preview-header";

type CampaignPreviewPageProps = {
  data: CampaignDetailData;
  orgId: string;
  campaignId: string;
};

export function CampaignPreviewPage({ data, orgId, campaignId }: CampaignPreviewPageProps) {
  const { campaign } = data;

  const isDonateEnabled = campaign.status === "ACTIVE" && campaign.publishedAt !== null;

  return (
    <div className="min-h-screen bg-background">
      <PreviewHeader orgId={orgId} campaignId={campaignId} />
      <CampaignPreviewContent data={data} isDonateEnabled={isDonateEnabled} />
    </div>
  );
}
