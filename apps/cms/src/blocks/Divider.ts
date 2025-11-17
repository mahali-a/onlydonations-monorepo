import type { Block } from "payload";

export const DividerBlock: Block = {
  slug: "divider",
  interfaceName: "DividerBlock",
  labels: {
    singular: "Divider",
    plural: "Dividers",
  },
  fields: [
    {
      name: "style",
      type: "select",
      options: [
        { label: "Thin Line", value: "thin" },
        { label: "Thick Line", value: "thick" },
        { label: "Dashed", value: "dashed" },
      ],
      defaultValue: "thin",
      label: "Divider Style",
    },
    {
      name: "color",
      type: "select",
      options: [
        { label: "Light Gray", value: "gray-light" },
        { label: "Dark Gray", value: "gray-dark" },
        { label: "Light Green", value: "green-light" },
        { label: "Primary", value: "primary" },
      ],
      defaultValue: "gray-light",
      label: "Color",
    },
    {
      name: "spacing",
      type: "group",
      label: "Spacing",
      fields: [
        {
          name: "topDesktop",
          type: "number",
          defaultValue: 48,
          label: "Top Margin - Desktop (px)",
        },
        {
          name: "bottomDesktop",
          type: "number",
          defaultValue: 48,
          label: "Bottom Margin - Desktop (px)",
        },
        {
          name: "topTablet",
          type: "number",
          defaultValue: 32,
          label: "Top Margin - Tablet (px)",
        },
        {
          name: "bottomTablet",
          type: "number",
          defaultValue: 32,
          label: "Bottom Margin - Tablet (px)",
        },
        {
          name: "topMobile",
          type: "number",
          defaultValue: 24,
          label: "Top Margin - Mobile (px)",
        },
        {
          name: "bottomMobile",
          type: "number",
          defaultValue: 24,
          label: "Bottom Margin - Mobile (px)",
        },
      ],
    },
  ],
};
