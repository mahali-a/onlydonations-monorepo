import type { Block } from "payload";

export const FundraiserExamplesBlock: Block = {
  slug: "fundraiser-examples",
  interfaceName: "FundraiserExamplesBlock",
  labels: {
    singular: "Fundraiser Examples",
    plural: "Fundraiser Examples Sections",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Section Title",
      defaultValue: "Examples of fundraisers",
    },
    {
      name: "ctaText",
      type: "text",
      label: "CTA Button Text",
    },
    {
      name: "ctaLink",
      type: "text",
      label: "CTA Button Link",
    },
    {
      name: "campaignIds",
      type: "array",
      label: "Campaign IDs",
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          name: "campaignId",
          type: "text",
          required: true,
          label: "Campaign ID",
          admin: {
            description: "The ID of the campaign to display",
          },
        },
      ],
    },
  ],
};
