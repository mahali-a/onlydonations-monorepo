import { HeartAndCircle } from "@/components/icons/marketing";
import type { HomeSuccessStory } from "@/features/home/types";

const DEFAULT_STORY_TEMPLATE = (campaign: HomeSuccessStory) =>
  `A successful fundraising campaign for ${campaign.title} that raised ${campaign.currency}${campaign.raisedAmount.toLocaleString()} with the help of ${campaign.donationsCount} supporters.`;

type Story = {
  key: number;
  title: string;
  body: string;
  storyLink: { link: string; label: string };
  amount: string;
  supporters: number;
  image: string;
};

type SuccessStoriesProps = {
  campaigns: HomeSuccessStory[];
};

export function SuccessStories({ campaigns }: SuccessStoriesProps) {
  const stories = campaigns.map(mapCampaignToStory);

  if (stories.length === 0) {
    return (
      <div className="mb-10 mt-10 flex flex-col items-center gap-20">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h4 className="flex items-center justify-center gap-2 font-geist text-[12px] font-normal leading-[18px] text-[#AF5903]">
            <HeartAndCircle /> success stories
          </h4>
          <h2 className="text-center font-eudoxus text-[34px] font-bold leading-[1.3] md:text-[58px] md:leading-[75.4px]">
            Real People, Real{" "}
            <span className="relative font-eudoxus">
              Impact
              <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDD3AA] md:h-7" />
            </span>
          </h2>
        </div>
        <div className="text-center text-gray-600">
          <p>Be the first to create a successful campaign!</p>
          <a className="text-blue-600 hover:underline" href="/login?next=/my-campaigns/create">
            Start Your Campaign
          </a>
        </div>
      </div>
    );
  }

  const [firstStory, ...remainingStories] = stories as [Story, ...Story[]];

  return (
    <div className="mb-10 mt-10 flex flex-col items-center gap-20">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h4 className="flex items-center justify-center gap-2 font-geist text-[12px] font-normal leading-[18px] text-[#AF5903]">
          <HeartAndCircle /> success stories
        </h4>
        <h2 className="text-center font-eudoxus text-[34px] font-bold leading-[1.3] md:text-[58px] md:leading-[75.4px]">
          Real People, Real{" "}
          <span className="relative font-eudoxus">
            Impact
            <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDD3AA] md:h-7" />
          </span>
        </h2>
      </div>

      <div className="flex w-full flex-col items-center gap-10 px-4 sm:px-6 md:gap-20 md:px-8">
        <div className="relative flex min-h-[712px] w-full max-w-[344px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#EFF0F2] bg-[#FEE9D4] px-6 shadow-sm sm:min-h-[650px] sm:max-w-[600px] sm:px-8 md:min-h-[509px] md:max-w-[1200px] md:flex-row md:items-center md:justify-between md:bg-white md:p-6">
          <div className="z-20 flex h-[395px] w-[296px] flex-col justify-between px-3 md:hidden">
            <StoryContent story={firstStory} layout="mobile" />
          </div>

          <div className="hidden rounded-2xl md:relative md:grid md:h-full md:w-full md:grid-cols-12 md:items-center md:overflow-hidden md:bg-white lg:bg-white">
            <div className="relative h-full md:col-span-5">
              <img
                alt={firstStory.title}
                className="h-full w-full rounded-2xl object-cover"
                loading="lazy"
                src={firstStory.image}
              />
            </div>

            <div className="md:relative md:z-10 md:flex md:h-full md:w-1/2 md:flex-shrink-0 md:flex-col md:justify-center md:p-6 lg:w-[350px]">
              <StoryContent story={firstStory} layout="desktop" />
            </div>

            <div className="pointer-events-none absolute -bottom-10 right-0 hidden lg:block">
              <img
                alt="Decorative ellipse"
                className="h-[450px] w-[450px]"
                loading="lazy"
                src="/images/marketing/home/ellipse-middle.png"
              />
            </div>
          </div>

          <div className="md:hidden">
            <img
              alt="Decorative mobile ellipse"
              className="absolute right-0 bottom-0"
              loading="lazy"
              src="/images/marketing/home/mobile-stack-ellipse.png"
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-10 md:max-w-[1200px] md:gap-8 lg:flex-row">
          {remainingStories.map((story) => (
            <div
              className="relative flex min-h-[712px] w-full max-w-[344px] flex-col items-center justify-center overflow-hidden rounded-[24px] border border-[#EFF0F2] bg-[#FEE9D4] px-6 shadow-sm sm:min-h-[650px] sm:max-w-[600px] sm:px-8 md:max-w-[580px] md:flex-col md:bg-white md:p-0"
              key={story.key}
            >
              <div className="z-20 flex h-[395px] w-[296px] flex-col justify-between px-3 md:hidden">
                <StoryContent story={story} layout="mobile" />
              </div>

              <div className="hidden md:flex md:min-h-[391px] md:w-full md:flex-row md:overflow-hidden md:rounded-[24px] md:border md:border-[#EFF0F2] md:bg-white md:shadow-sm">
                <div className="md:w-[368px] md:p-6">
                  <img
                    alt={story.title}
                    className="md:h-full md:w-full md:rounded-[16px] md:object-cover"
                    height={391}
                    loading="lazy"
                    src={story.image}
                    width={368}
                  />
                </div>
                <div className="md:flex md:w-1/2 md:flex-col md:justify-center md:p-6">
                  <StoryContent story={story} layout="desktop" />
                </div>
              </div>

              <div className="md:hidden">
                <img
                  alt="Decorative mobile ellipse"
                  className="absolute right-0 bottom-0"
                  loading="lazy"
                  src="/images/marketing/home/mobile-stack-ellipse.png"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function mapCampaignToStory(campaign: HomeSuccessStory, index: number): Story {
  const descriptions = [
    `A successful fundraising campaign that raised ${campaign.currency}${campaign.raisedAmount.toLocaleString()} to support ${campaign.title}. Thanks to the generosity of ${campaign.donationsCount} supporters, this campaign has made a real impact in the community.`,
    `This campaign demonstrates the power of collective giving, with ${campaign.donationsCount} people coming together to raise ${campaign.currency}${campaign.raisedAmount.toLocaleString()} for ${campaign.title}. Every donation contributed to this success story.`,
    `Through dedicated fundraising efforts and community support, this campaign successfully raised ${campaign.currency}${campaign.raisedAmount.toLocaleString()} with the help of ${campaign.donationsCount} generous donors. ${campaign.title} is now making a difference.`,
  ];

  return {
    key: index + 1,
    title: campaign.title,
    body: descriptions[index] ?? DEFAULT_STORY_TEMPLATE(campaign),
    storyLink: {
      link: `/f/${campaign.slug}`,
      label: "Read this story",
    },
    amount: `${campaign.currency}${campaign.raisedAmount.toLocaleString()}`,
    supporters: campaign.donationsCount,
    image: campaign.coverImageUrl,
  };
}

type StoryContentProps = {
  story: Story;
  layout: "mobile" | "desktop";
};

function StoryContent({ story, layout }: StoryContentProps) {
  const isDesktop = layout === "desktop";

  return (
    <div className={!isDesktop ? "flex flex-col gap-6" : "flex flex-col gap-6"}>
      <h3
        className={`font-eudoxus font-bold text-[#D56C04] ${
          isDesktop ? "text-[34px] leading-[40.8px]" : "text-[28px] leading-[42px]"
        }`}
      >
        {story.title}
      </h3>
      <p className="line-clamp-3 font-geist text-[16px] font-medium leading-6 tracking-[-2%] text-[#828EA3]">
        {story.body}
      </p>
      <a
        className="inline-flex items-center gap-1 font-geist text-[14px] font-semibold leading-[14px] text-[#D56C04] underline underline-offset-2"
        href={story.storyLink.link}
      >
        {story.storyLink.label} →
      </a>
      <div className="flex gap-8 sm:gap-10 md:flex md:flex-col md:gap-6">
        <div className="flex flex-col">
          <span className="font-geist text-[14px] font-medium leading-[21px] tracking-[-2%] text-[#828EA3]">
            Amount Raised
          </span>
          <span className="font-eudoxus text-[28px] font-bold leading-[40.8px] text-[#2B313B]">
            {story.amount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-geist text-[14px] font-medium leading-[21px] tracking-[-2%] text-[#828EA3]">
            Supporters
          </span>
          <span className="font-eudoxus text-[28px] font-bold leading-[40.8px] text-[#2B313B]">
            {story.supporters}
          </span>
        </div>
      </div>
    </div>
  );
}
