import type { retrieveCampaignDetailFromServer } from "./campaigns-loaders";

export type CampaignDetailRouteContext = Awaited<
  ReturnType<typeof retrieveCampaignDetailFromServer>
>;
