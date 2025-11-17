import type { Block } from "payload";

export const FAQBlock: Block = {
  slug: "faq",
  interfaceName: "FAQBlock",
  labels: {
    singular: "FAQ",
    plural: "FAQs",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "FAQ Section Title",
    },
    {
      name: "faqs",
      type: "array",
      label: "FAQ Items",
      minRows: 1,
      fields: [
        {
          name: "question",
          type: "text",
          required: true,
          label: "Question",
        },
        {
          name: "answer",
          type: "richText",
          required: true,
          label: "Answer",
        },
      ],
    },
    {
      name: "displayStyle",
      type: "select",
      options: [
        { label: "Accordion", value: "accordion" },
        { label: "Expanded", value: "expanded" },
        { label: "Two Column", value: "two-column" },
      ],
      defaultValue: "accordion",
      label: "Display Style",
    },
    {
      name: "responsive",
      type: "group",
      label: "Responsive Settings",
      fields: [
        {
          name: "tabletDisplayStyle",
          type: "select",
          options: [
            { label: "Accordion", value: "accordion" },
            { label: "Expanded", value: "expanded" },
            { label: "Two Column", value: "two-column" },
          ],
          defaultValue: "accordion",
          label: "Tablet Display Style",
        },
        {
          name: "mobileDisplayStyle",
          type: "select",
          options: [
            { label: "Accordion", value: "accordion" },
            { label: "Expanded", value: "expanded" },
          ],
          defaultValue: "accordion",
          label: "Mobile Display Style",
        },
      ],
    },
  ],
};
