import type { Block } from "payload";

export const FeatureHighlightBlock: Block = {
  slug: "feature-highlight",
  interfaceName: "FeatureHighlightBlock",
  labels: {
    singular: "Feature Highlight",
    plural: "Feature Highlights",
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
      name: "features",
      type: "array",
      label: "Features",
      minRows: 1,
      fields: [
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
          label: "Feature Icon",
          required: true,
        },
        {
          name: "title",
          type: "text",
          required: true,
          label: "Feature Title",
        },
        {
          name: "description",
          type: "richText",
          label: "Feature Description",
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
      name: "iconSize",
      type: "select",
      options: [
        { label: "Small (40px)", value: "small" },
        { label: "Medium (60px)", value: "medium" },
        { label: "Large (80px)", value: "large" },
      ],
      defaultValue: "medium",
      label: "Icon Size",
    },
    {
      name: "alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
      defaultValue: "center",
      label: "Text Alignment",
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
