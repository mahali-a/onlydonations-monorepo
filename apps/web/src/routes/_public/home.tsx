import { createFileRoute } from "@tanstack/react-router";
import { Quote, Calendar, Heart, Share2 } from "lucide-react";
import {
    HeroSection,
    HowItWorksSection,
    IconCardsSection,
    FundraiserExamplesSection,
    FaqSection,
    type IconCardItem,
    type FaqItem,
    type Fundraiser,
    type HeroContent,
} from "@/features/home/ui";
import { RenderBlocks } from "@/components/cms/render-blocks";
import {
    retrieveCmsBaseUrlFromServer,
    retrievePageFromServerBySlug,
} from "@/server/functions/cms";
import type { Page } from "@repo/types/payload";
import { mockHomePage } from "@/features/home/data/mock-home-page";

export const Route = createFileRoute("/_public/home")({
    loader: async () => {
        // For testing: use mock data instead of fetching from CMS
        // TODO: Switch back to real CMS after testing
        const USE_MOCK_DATA = true;

        if (USE_MOCK_DATA) {
            return {
                page: mockHomePage as any,
                cmsBaseUrl: "",
            };
        }

        const [page, cmsBaseUrl] = await Promise.all([
            retrievePageFromServerBySlug({ data: { slug: "home" } }),
            retrieveCmsBaseUrlFromServer(),
        ]);

        return { page, cmsBaseUrl };
    },
    component: Home,
});

const heroContent: HeroContent = {
    title: "Start a Charity Fundraiser on onlydonations",
    description:
        "Make a difference for your favorite nonprofit by starting a onlydonations for your birthday, a marathon, or just because you care.",
    ctaText: "Start a onlydonations",
    imageUrl:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Volunteers serving food",
};

const tips: IconCardItem[] = [
    {
        id: "share-why",
        icon: Quote,
        title: 'Share your "why"',
        description:
            "In your fundraising description, share why you are fundraising for the charity. Researching the charity's website for a quick mission statement or to explain how they live out their cause is also helpful for potential donors.",
    },
    {
        id: "use-events",
        icon: Calendar,
        title: "Use events or moments",
        description:
            "One way to help drive donations is to tie your cause back to a timely moment or event. Whether it's breast cancer awareness month, an upcoming marathon, a birthday, or a random Tuesday that you want to make special, share the date so people can get excited.",
    },
    {
        id: "thank-donors",
        icon: Heart,
        title: "Thank and update donors",
        description:
            "Easily keep donors updated about the campaign's progress and thank them for their support. Simple gestures like personalized thank you notes with an ask for additional help in sharing your cause with their networks is easy but powerful.",
    },
    {
        id: "spread-word",
        icon: Share2,
        title: "Spread the word",
        description:
            "Share your fundraiser across social media platforms and encourage friends and family to do the same. The more people who see your campaign, the more likely you are to reach your goal and make a meaningful impact.",
    },
];

const fundraisers: Fundraiser[] = [
    {
        id: "chris-cycles",
        name: "Chris Cycles for Feed the Children",
        title: "Chris Cycles for Feed the Children",
        description:
            "Chris Luff has set off to cycle across the country in support of Canadian Feed The Children and to raise awareness of the need for a nationwide food program.",
        raised: 30375,
        goal: 30000,
        imageUrl:
            "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop",
    },
    {
        id: "parrot-partners",
        name: "Parrot Partners Canada",
        title: "Support Parrot Rescue and Rehabilitation",
        description:
            "Parrot Partners Canada is dedicated to rescuing, rehabilitating, and rehoming parrots in need. Your support helps provide medical care, nutritious food, and safe housing for these beautiful birds.",
        raised: 15200,
        goal: 25000,
        imageUrl:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?q=80&w=2025&auto=format&fit=crop",
    },
    {
        id: "wheatland-hospice",
        name: "Wheatland and Area Hospice Society",
        title: "Compassionate End-of-Life Care",
        description:
            "The Wheatland and Area Hospice Society provides compassionate care and support to individuals and families facing end-of-life journeys. Help us continue offering dignity, comfort, and peace during life's most challenging moments.",
        raised: 42800,
        goal: 50000,
        imageUrl:
            "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2031&auto=format&fit=crop",
    },
];

const faqs: FaqItem[] = [
    {
        id: "receive-money",
        question: "How does the charity receive the money I raise?",
        answer:
            "Funds raised on a charity fundraiser through onlydonations will be processed through our payment partner, PayPal Giving Fund, who will deliver the funds directly to the charity on your behalf. As the fundraiser organizer, you do not need to do anything to transfer funds to the charity!",
    },
    {
        id: "charity-details",
        question: "What details should I include in a charity fundraiser?",
        answer:
            "Include the charity's name, your fundraising goal, why you're raising funds, and how the money will be used. Adding photos and regular updates can help engage potential donors and build trust in your campaign.",
    },
    {
        id: "raise-goal",
        question: "Can I raise my goal if the financial needs increase?",
        answer:
            "Yes, you can adjust your fundraising goal at any time. Simply go to your fundraiser dashboard and update the goal amount. This flexibility allows you to respond to changing needs while keeping your donors informed.",
    },
    {
        id: "marathon-fundraise",
        question:
            "I'm running a marathon, as part of my experience can I use onlydonations to fundraise for a charity?",
        answer:
            "Absolutely! Many people use athletic events like marathons as an opportunity to raise money for causes they care about. You can create a charity fundraiser and share it with your supporters as you train and participate in your event.",
    },
    {
        id: "charity-keeps",
        question: "How much of the money I raise does the charity keep?",
        answer:
            "When you raise money through PayPal Giving Fund, 100% of your donation goes to the charity. onlydonations and PayPal Giving Fund do not charge any platform fees for charity fundraisers, ensuring maximum impact for your chosen cause.",
    },
    {
        id: "in-memory",
        question: "Can I raise money on onlydonations for a charity in memory of my loved one?",
        answer:
            "Yes, memorial fundraisers are a meaningful way to honor a loved one's legacy. You can create a charity fundraiser dedicated to their memory, share their story, and invite others to contribute to a cause that was important to them.",
    },
    {
        id: "team-members",
        question: "Can I add friends and family as team members?",
        answer:
            "Yes, you can invite friends and family to join your fundraising efforts as team members. Team fundraising allows multiple people to work together toward a common goal, expanding your reach and making fundraising more collaborative and fun.",
    },
];

function Home() {
    const { page, cmsBaseUrl } = Route.useLoaderData() as { page: Page | null; cmsBaseUrl: string };

    // If CMS page exists, use blocks from CMS
    if (page && page.blocks && page.blocks.length > 0) {
        return (
            <div className="min-h-screen bg-white font-sans text-[#2a2e30]">
                <RenderBlocks blocks={page.blocks} cmsBaseUrl={cmsBaseUrl} />
            </div>
        );
    }

    // Fallback to hardcoded content if no CMS page
    return (
        <div className="min-h-screen bg-white font-sans text-[#2a2e30]">
            <HeroSection content={heroContent} />

            <HowItWorksSection title="How to start a onlydonations" ctaText="Start a onlydonations" />

            <IconCardsSection
                title="Tips for your charity fundraiser on onlydonations"
                items={tips}
                moreButtonText="More Tips"
            />

            <FundraiserExamplesSection
                title="Examples of charity fundraisers on onlydonations"
                fundraisers={fundraisers}
                ctaText="Start a Fundraiser"
            />

            <FaqSection
                title="Questions about charity fundraising on onlydonations"
                faqs={faqs}
                moreButtonText="More FAQs"
            />
        </div>
    );
}
