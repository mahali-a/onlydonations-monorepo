import type { Block } from "payload";

export const RichTextBlock: Block = {
  slug: "rich-text",
  interfaceName: "RichTextBlock",
  labels: {
    singular: "Rich Text",
    plural: "Rich Text Blocks",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      required: true,
      label: "Content",
    },
    {
      name: "alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "left",
      label: "Text Alignment",
    },
    {
      name: "maxWidth",
      type: "select",
      options: [
        { label: "Full Width", value: "full" },
        { label: "Large (1200px)", value: "large" },
        { label: "Medium (900px)", value: "medium" },
        { label: "Small (600px)", value: "small" },
      ],
      defaultValue: "full",
      label: "Max Width",
    },
    {
      name: "spacing",
      type: "group",
      label: "Spacing",
      fields: [
        {
          name: "topDesktop",
          type: "number",
          defaultValue: 32,
          label: "Top Padding - Desktop (px)",
        },
        {
          name: "bottomDesktop",
          type: "number",
          defaultValue: 32,
          label: "Bottom Padding - Desktop (px)",
        },
        {
          name: "topTablet",
          type: "number",
          defaultValue: 24,
          label: "Top Padding - Tablet (px)",
        },
        {
          name: "bottomTablet",
          type: "number",
          defaultValue: 24,
          label: "Bottom Padding - Tablet (px)",
        },
        {
          name: "topMobile",
          type: "number",
          defaultValue: 16,
          label: "Top Padding - Mobile (px)",
        },
        {
          name: "bottomMobile",
          type: "number",
          defaultValue: 16,
          label: "Bottom Padding - Mobile (px)",
        },
      ],
    },
  ],
};
