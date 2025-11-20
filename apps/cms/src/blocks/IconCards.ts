import type { Block } from "payload";

export const IconCardsBlock: Block = {
    slug: "icon-cards",
    interfaceName: "IconCardsBlock",
    labels: {
        singular: "Icon Cards",
        plural: "Icon Cards Sections",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            label: "Section Title",
        },
        {
            name: "moreButtonText",
            type: "text",
            label: "More Button Text",
        },
        {
            name: "moreButtonLink",
            type: "text",
            label: "More Button Link",
        },
        {
            name: "items",
            type: "array",
            label: "Icon Card Items",
            minRows: 1,
            fields: [
                {
                    name: "iconName",
                    type: "select",
                    required: true,
                    label: "Icon",
                    options: [
                        { label: "Quote", value: "quote" },
                        { label: "Calendar", value: "calendar" },
                        { label: "Heart", value: "heart" },
                        { label: "Share", value: "share" },
                        { label: "Star", value: "star" },
                        { label: "Check", value: "check" },
                        { label: "Info", value: "info" },
                        { label: "Lightbulb", value: "lightbulb" },
                    ],
                },
                {
                    name: "title",
                    type: "text",
                    required: true,
                    label: "Card Title",
                },
                {
                    name: "description",
                    type: "textarea",
                    required: true,
                    label: "Card Description",
                },
            ],
        },
    ],
};
