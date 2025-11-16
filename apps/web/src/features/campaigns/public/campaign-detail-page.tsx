import type { CampaignDetailData } from "./types";
import { CampaignDetailContent } from "./ui/campaign-detail-content";

type CampaignDetailPageProps = {
  data: CampaignDetailData;
};

export function CampaignDetailPage({ data }: CampaignDetailPageProps) {
  return <CampaignDetailContent data={data} isDonateEnabled={false} />;
}
