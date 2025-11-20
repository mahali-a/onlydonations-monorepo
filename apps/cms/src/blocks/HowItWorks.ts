import type { Block } from "payload";

export const HowItWorksBlock: Block = {
    slug: "how-it-works",
    interfaceName: "HowItWorksBlock",
    labels: {
        singular: "How It Works",
        plural: "How It Works Sections",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            label: "Section Title",
            defaultValue: "How to get started",
        },
        {
            name: "ctaText",
            type: "text",
            required: true,
            label: "CTA Button Text",
            defaultValue: "Get Started",
        },
        {
            name: "ctaLink",
            type: "text",
            label: "CTA Button Link",
            defaultValue: "#",
        },
    ],
};
