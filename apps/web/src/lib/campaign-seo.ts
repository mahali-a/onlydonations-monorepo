import { seo } from "./seo";

const DEFAULT_OG_IMAGE = "https://assets.onlydonations.com/public/og-image.png";

type CampaignWithSeo = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  title: string;
  description?: string | null;
  coverImage?: string | null;
};

export function getCampaignSeo(
  campaign: CampaignWithSeo,
  options?: {
    url?: string;
    titlePrefix?: string;
  },
) {
  const title = campaign.seoTitle || campaign.title;
  const finalTitle = options?.titlePrefix ? `${options.titlePrefix}${title}` : title;

  const description = campaign.seoDescription || campaign.description || "";
  const truncatedDescription =
    description.length > 160 ? `${description.substring(0, 157)}...` : description;

  let image: string | undefined;
  if (campaign.seoImage) {
    image = campaign.seoImage.startsWith("http") ? campaign.seoImage : DEFAULT_OG_IMAGE;
  } else if (campaign.coverImage) {
    image = campaign.coverImage.startsWith("http") ? campaign.coverImage : DEFAULT_OG_IMAGE;
  } else {
    image = DEFAULT_OG_IMAGE;
  }

  const metaTags = seo({
    title: finalTitle,
    description: truncatedDescription || undefined,
    image,
  });

  if (options?.url) {
    metaTags.push({
      property: "og:url",
      content: options.url,
    });
  }

  return metaTags;
}
