import type { Block } from "payload";

export const CalculatorBlock: Block = {
  slug: "calculator",
  interfaceName: "CalculatorBlock",
  labels: {
    singular: "Calculator",
    plural: "Calculators",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Calculator Title",
      defaultValue: "Let's do the maths together",
    },
    {
      name: "description",
      type: "richText",
      label: "Calculator Description",
    },
    {
      name: "examples",
      type: "array",
      label: "Donation Scenarios",
      minRows: 1,
      fields: [
        {
          name: "totalRaised",
          type: "number",
          required: true,
          label: "Total Amount Raised ($)",
        },
        {
          name: "numberOfDonors",
          type: "number",
          required: true,
          label: "Number of Donors",
        },
        {
          name: "averageDonationAmount",
          type: "number",
          label: "Average Donation Amount ($)",
        },
      ],
    },
    {
      name: "feeConfiguration",
      type: "group",
      label: "Fee Configuration (for calculations)",
      fields: [
        {
          name: "transactionFeePercentage",
          type: "number",
          required: true,
          defaultValue: 1.95,
          label: "Transaction Fee Percentage (%)",
          admin: {
            description: "Paystack fee for all payment methods",
          },
        },
        {
          name: "donorContributionPercentage",
          type: "number",
          defaultValue: 0,
          label: "Your Cut on Transactions (%)",
          admin: {
            description: "Optional percentage you take (currently 0%)",
          },
        },
      ],
    },
    {
      name: "responsive",
      type: "group",
      label: "Responsive Settings",
      fields: [
        {
          name: "desktopColumns",
          type: "select",
          options: [
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
          ],
          defaultValue: "2",
          label: "Desktop Columns",
        },
        {
          name: "tabletColumns",
          type: "select",
          options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
          ],
          defaultValue: "2",
          label: "Tablet Columns",
        },
        {
          name: "mobileColumns",
          type: "select",
          options: [{ label: "1 Column", value: "1" }],
          defaultValue: "1",
          label: "Mobile Columns",
        },
      ],
    },
  ],
};
