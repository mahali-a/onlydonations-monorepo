// @ts-nocheck
import type { Page } from "@repo/types/payload";

export const DEMO_BLOCKS: { title: string; block: Page["blocks"][0] }[] = [
    {
        title: "Hero Block",
        block: {
            blockType: "hero",
            id: "hero-demo",
            title: "Make a Difference Today",
            description:
                "Join our community of changemakers and help support causes that matter. Every donation counts towards building a better future.",
            ctaText: "Start Fundraising",
            ctaLink: "/start",
            backgroundImage: {
                url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
                alt: "Hero Background",
            } as any,
        },
    },
    {
        title: "Hero Overlapping Block",
        block: {
            blockType: "hero-overlapping",
            id: "hero-overlapping-demo",
            title: "Start a Charity Fundraiser",
            description:
                "Make a difference for your favorite nonprofit by starting a fundraiser for your birthday, a marathon, or just because you care.",
            ctaText: "Start Now",
            ctaLink: "/start",
            imageUrl:
                "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
            imageAlt: "Volunteers serving food",
            backgroundColor: "beige",
        },
    },
    {
        title: "Stats Block",
        block: {
            blockType: "stats",
            id: "stats-demo",
            stats: [
                { label: "Donations Raised", value: "$10M+" },
                { label: "Active Campaigns", value: "5,000+" },
                { label: "Happy Donors", value: "1M+" },
                { label: "Countries Reached", value: "50+" },
            ],
        },
    },
    {
        title: "Feature Highlight Block",
        block: {
            blockType: "feature-highlight",
            id: "feature-highlight-demo",
            title: "Secure & Transparent",
            description:
                "We ensure that every penny you donate goes directly to the cause. Our platform is built with bank-grade security to protect your data and transactions.",
            image: {
                url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
                alt: "Security Feature",
            } as any,
            imagePosition: "right",
            ctaText: "Learn More",
            ctaLink: "/security",
        },
    },
    {
        title: "Two Column Block",
        block: {
            blockType: "two-column",
            id: "two-column-demo",
            leftContent: {
                contentType: "text",
                text: {
                    root: {
                        type: "root",
                        children: [
                            {
                                type: "heading",
                                tag: "h2",
                                children: [{ text: "Our Mission", version: 1 }],
                                version: 1,
                            },
                            {
                                type: "paragraph",
                                children: [
                                    {
                                        text: "We are dedicated to empowering individuals and organizations to create positive change in the world through effective fundraising tools and support.",
                                        version: 1,
                                    },
                                ],
                                version: 1,
                            },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1,
                    },
                },
            },
            rightContent: {
                contentType: "media",
                image: {
                    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop",
                    alt: "Team meeting",
                } as any,
            },
            responsive: {
                columnRatio: "50-50",
                stackMobile: true,
                reverseOrder: false,
            },
        },
    },
    {
        title: "Three Column Card Block",
        block: {
            blockType: "three-column-card",
            id: "three-column-card-demo",
            cards: [
                {
                    title: "Create",
                    description: "Start your campaign in minutes with our easy-to-use tools.",
                    icon: "pencil",
                },
                {
                    title: "Share",
                    description: "Spread the word via social media and email to reach more donors.",
                    icon: "share",
                },
                {
                    title: "Track",
                    description: "Monitor your progress and thank donors in real-time.",
                    icon: "chart",
                },
            ],
        },
    },
    {
        title: "Icon Cards Block",
        block: {
            blockType: "icon-cards",
            id: "icon-cards-demo",
            title: "Fundraising Tips",
            items: [
                {
                    icon: "heart",
                    title: "Tell your story",
                    description: "Be authentic and explain why this cause matters to you.",
                },
                {
                    icon: "camera",
                    title: "Use great photos",
                    description: "Images help connect donors emotionally to your cause.",
                },
                {
                    icon: "users",
                    title: "Build a team",
                    description: "Fundraising is more fun and effective with friends.",
                },
            ],
            moreButtonText: "View All Tips",
            moreButtonLink: "/tips",
        },
    },
    {
        title: "How It Works Block",
        block: {
            blockType: "how-it-works",
            id: "how-it-works-demo",
            title: "How to Start Fundraising",
            ctaText: "Get Started",
            ctaLink: "/start",
        },
    },
    {
        title: "Fundraiser Examples Block",
        block: {
            blockType: "fundraiser-examples",
            id: "fundraiser-examples-demo",
            title: "Success Stories",
            ctaText: "Start Yours",
            ctaLink: "/start",
            campaignIds: [
                { id: "camp-1", campaignId: "demo-campaign-1" },
                { id: "camp-2", campaignId: "demo-campaign-2" },
                { id: "camp-3", campaignId: "demo-campaign-3" },
            ],
        },
    },
    {
        title: "Gallery Block (Masonry)",
        block: {
            blockType: "gallery",
            id: "gallery-demo",
            title: "Community in Action",
            description: {
                root: {
                    type: "root",
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    text: "See how our community is making a difference around the world.",
                                    version: 1,
                                },
                            ],
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    version: 1,
                },
            },
            layout: "masonry",
            images: [
                {
                    id: "img1",
                    image: {
                        url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
                        alt: "Volunteers",
                    } as any,
                    caption: "Food drive volunteers",
                },
                {
                    id: "img2",
                    image: {
                        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
                        alt: "Charity event",
                    } as any,
                },
                {
                    id: "img3",
                    image: {
                        url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
                        alt: "Teamwork",
                    } as any,
                },
                {
                    id: "img4",
                    image: {
                        url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop",
                        alt: "Meeting",
                    } as any,
                },
            ],
        },
    },
    {
        title: "Image/Video Block (Image)",
        block: {
            blockType: "image-video",
            id: "image-demo",
            mediaType: "image",
            image: {
                url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2049&auto=format&fit=crop",
                alt: "Office vibe",
            } as any,
            caption: "Our new office space",
            width: "medium",
            alignment: "center",
        },
    },
    {
        title: "Image/Video Block (Video)",
        block: {
            blockType: "image-video",
            id: "video-demo",
            mediaType: "video",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            caption: "Campaign Video",
            width: "medium",
            alignment: "center",
        },
    },
    {
        title: "Rich Text Block",
        block: {
            blockType: "rich-text",
            id: "rich-text-demo",
            maxWidth: "medium",
            alignment: "left",
            content: {
                root: {
                    type: "root",
                    children: [
                        {
                            type: "heading",
                            tag: "h2",
                            children: [{ text: "Why We Do It", version: 1 }],
                            version: 1,
                        },
                        {
                            type: "paragraph",
                            children: [
                                {
                                    text: "We believe that everyone has the power to make a difference. By providing the right tools and support, we can unlock the potential of millions of people to change the world.",
                                    version: 1,
                                },
                            ],
                            version: 1,
                        },
                        {
                            type: "quote",
                            children: [
                                {
                                    text: "The best way to find yourself is to lose yourself in the service of others.",
                                    version: 1,
                                },
                            ],
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    version: 1,
                },
            },
        },
    },
    {
        title: "Accordion Block",
        block: {
            blockType: "accordion",
            id: "accordion-demo",
            items: [
                {
                    title: "What is the platform fee?",
                    content: {
                        root: {
                            type: "root",
                            children: [
                                {
                                    type: "paragraph",
                                    children: [{ text: "Our platform is free to use for organizers.", version: 1 }],
                                    version: 1,
                                },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            version: 1,
                        },
                    },
                },
                {
                    title: "How do I withdraw funds?",
                    content: {
                        root: {
                            type: "root",
                            children: [
                                {
                                    type: "paragraph",
                                    children: [
                                        {
                                            text: "You can withdraw funds directly to your bank account at any time.",
                                            version: 1,
                                        },
                                    ],
                                    version: 1,
                                },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            version: 1,
                        },
                    },
                },
            ],
        },
    },
    {
        title: "FAQ Block",
        block: {
            blockType: "faq",
            id: "faq-demo",
            title: "Common Questions",
            displayStyle: "accordion",
            faqs: [
                {
                    id: "q1",
                    question: "Is it safe?",
                    answer: "Yes, we use industry-standard encryption.",
                },
                {
                    id: "q2",
                    question: "Can I raise money for anything?",
                    answer: "As long as it complies with our terms of service.",
                },
            ],
            moreButtonText: "See All FAQs",
            moreButtonLink: "/faq",
        },
    },
    {
        title: "Calculator Block",
        block: {
            blockType: "calculator",
            id: "calculator-demo",
            title: "Impact Calculator",
            description: {
                root: {
                    type: "root",
                    children: [
                        {
                            type: "paragraph",
                            children: [
                                {
                                    text: "See how far your donation can go.",
                                    version: 1,
                                },
                            ],
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    version: 1,
                },
            },
            feeConfiguration: {
                transactionFeePercentage: 2.9,
                donorContributionPercentage: 5,
            },
            examples: [
                {
                    id: "ex1",
                    totalRaised: 1000,
                    numberOfDonors: 20,
                },
                {
                    id: "ex2",
                    totalRaised: 5000,
                    numberOfDonors: 100,
                },
                {
                    id: "ex3",
                    totalRaised: 10000,
                    numberOfDonors: 250,
                },
            ],
        },
    },
    {
        title: "Contact Form Block",
        block: {
            blockType: "contact-form",
            id: "contact-form-demo",
            title: "Get in Touch",
            description: "Have questions? We're here to help.",
        },
    },
    {
        title: "CTA Block",
        block: {
            blockType: "cta",
            id: "cta-demo",
            title: "Ready to start?",
            description: "Launch your campaign today and start making an impact.",
            ctaText: "Start Fundraising",
            ctaLink: "/start",
            style: "solid",
        },
    },
    {
        title: "Divider Block",
        block: {
            blockType: "divider",
            id: "divider-demo",
            style: "thin",
            color: "gray-light",
        },
    },
    {
        title: "Pricing Block",
        block: {
            blockType: "pricing",
            id: "pricing-demo",
            title: "Transparent Pricing, Maximum Impact",
            subtitle:
                "At OnlyDonations, we believe in keeping fees low so more of your donations reach those who need it most. Our transparent pricing ensures you know exactly where every cedi goes.",
            contactEmail: "support@onlydonations.com",
            donorFee: {
                title: "Donor fee",
                description:
                    "A small fee for donations paid are paid by the donor. This goes to our payment processor, not OnlyDonations. Think of this like the processing fees all banks charge on transfers.",
                percentage: 1.5,
            },
            fundraisingFee: {
                title: "Fundraising fee",
                description:
                    "Includes: operating costs, support and team until budgets operations. This helps us keep OnlyDonations running for everyone, so you can continue to make impact.",
                percentage: 4,
                learnMoreLink: "/about/why-we-charge-fees",
            },
            showCalculator: true,
            calculatorDefaultAmount: 10000,
        },
    },
];
