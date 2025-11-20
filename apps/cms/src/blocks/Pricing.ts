import type { Block } from "payload";

export const PricingBlock: Block = {
  slug: "pricing",
  interfaceName: "PricingBlock",
  labels: {
    singular: "Pricing",
    plural: "Pricing",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
      defaultValue: "Transparent Pricing, Maximum Impact",
      required: true,
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Subtitle",
      defaultValue:
        "At OnlyDonations, we believe in keeping fees low so more of your donations reach those who need it most. Our transparent pricing ensures you know exactly where every cedi goes.",
    },
    {
      name: "contactEmail",
      type: "text",
      label: "Contact Email (optional)",
      admin: {
        description: "Override the contact email. Leave blank to use Settings email.",
      },
    },
    // Donor Fee Card
    {
      name: "donorFee",
      type: "group",
      label: "Donor Fee Card",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Title",
          defaultValue: "Donor fee",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
          defaultValue:
            "A small fee for donations paid are paid by the donor. This goes to our payment processor, not OnlyDonations. Think of this like the processing fees all banks charge on transfers.",
          required: true,
        },
        {
          name: "percentage",
          type: "number",
          label: "Percentage",
          defaultValue: 1.5,
          required: true,
          admin: {
            description: "Fee percentage (e.g., 1.5 for 1.5%)",
          },
        },
      ],
    },
    // Fundraising Fee Card
    {
      name: "fundraisingFee",
      type: "group",
      label: "Fundraising Fee Card",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Title",
          defaultValue: "Fundraising fee",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Description",
          defaultValue:
            "Includes: operating costs, support and team until budgets operations. This helps us keep OnlyDonations running for everyone, so you can continue to make impact.",
          required: true,
        },
        {
          name: "percentage",
          type: "number",
          label: "Percentage",
          defaultValue: 4,
          required: true,
          admin: {
            description: "Platform fee percentage (e.g., 4 for 4%)",
          },
        },
        {
          name: "learnMoreLink",
          type: "text",
          label: "Learn More Link (optional)",
          admin: {
            description: "URL to page explaining why you charge fees",
          },
        },
      ],
    },
    // Calculator
    {
      name: "showCalculator",
      type: "checkbox",
      defaultValue: true,
      label: "Show Calculator",
    },
    {
      name: "calculatorDefaultAmount",
      type: "number",
      label: "Calculator Default Amount (GHS)",
      defaultValue: 10000,
      admin: {
        condition: (_, siblingData) => siblingData?.showCalculator === true,
      },
    },
  ],
};
