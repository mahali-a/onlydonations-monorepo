import type { Block } from "payload";

export const HeroOverlappingBlock: Block = {
    slug: "hero-overlapping",
    interfaceName: "HeroOverlappingBlock",
    labels: {
        singular: "Hero (Overlapping)",
        plural: "Heroes (Overlapping)",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            label: "Title",
        },
        {
            name: "description",
            type: "textarea",
            required: true,
            label: "Description",
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
        {
            name: "imageUrl",
            type: "text",
            required: true,
            label: "Image URL",
        },
        {
            name: "imageAlt",
            type: "text",
            required: true,
            label: "Image Alt Text",
        },
        {
            name: "backgroundColor",
            type: "select",
            options: [
                { label: "Beige", value: "beige" },
                { label: "White", value: "white" },
                { label: "Light Gray", value: "gray-light" },
            ],
            defaultValue: "beige",
            label: "Background Color",
        },
    ],
};
