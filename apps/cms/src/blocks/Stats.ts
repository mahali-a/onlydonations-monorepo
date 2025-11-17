import type { Block } from "payload";

export const StatsBlock: Block = {
  slug: "stats",
  interfaceName: "StatsBlock",
  labels: {
    singular: "Stats",
    plural: "Stats",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
    },
    {
      name: "description",
      type: "richText",
      label: "Section Description",
    },
    {
      name: "stats",
      type: "array",
      label: "Statistics",
      minRows: 1,
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "Stat Value",
          admin: {
            description: "e.g., 1M, 10K, GHS 1B",
          },
        },
        {
          name: "label",
          type: "text",
          required: true,
          label: "Stat Label",
          admin: {
            description: "e.g., Funds Raised, Supporters, Communities",
          },
        },
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
          label: "Icon (optional)",
        },
        {
          name: "description",
          type: "text",
          label: "Description (optional)",
        },
      ],
    },
    {
      name: "layout",
      type: "select",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      defaultValue: "3",
      label: "Desktop Layout",
    },
    {
      name: "backgroundColor",
      type: "select",
      options: [
        { label: "White", value: "white" },
        { label: "Light Gray", value: "gray-light" },
        { label: "Light Green", value: "green-light" },
        { label: "Primary", value: "primary" },
      ],
      defaultValue: "white",
      label: "Background Color",
    },
    {
      name: "responsive",
      type: "group",
      label: "Responsive Settings",
      fields: [
        {
          name: "tabletColumns",
          type: "select",
          options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
          ],
          defaultValue: "2",
          label: "Tablet Columns",
        },
        {
          name: "mobileColumns",
          type: "select",
          options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
          ],
          defaultValue: "1",
          label: "Mobile Columns",
        },
      ],
    },
  ],
};
