import type { Block } from "payload";

export const CTABlock: Block = {
  slug: "cta",
  interfaceName: "CTABlock",
  labels: {
    singular: "Call to Action",
    plural: "Calls to Action",
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
      type: "richText",
      label: "Description",
    },
    {
      name: "buttons",
      type: "array",
      label: "Buttons",
      minRows: 1,
      maxRows: 3,
      fields: [
        {
          name: "buttonText",
          type: "text",
          required: true,
          label: "Button Text",
        },
        {
          name: "buttonLink",
          type: "text",
          required: true,
          label: "Button Link (URL or internal route)",
        },
        {
          name: "buttonStyle",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
          defaultValue: "primary",
          label: "Button Style",
        },
        {
          name: "buttonSize",
          type: "select",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
          defaultValue: "medium",
          label: "Button Size",
        },
      ],
    },
    {
      name: "alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "center",
      label: "Content Alignment",
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
          name: "buttonStackMobile",
          type: "checkbox",
          defaultValue: true,
          label: "Stack Buttons Vertically on Mobile",
        },
        {
          name: "buttonStackTablet",
          type: "checkbox",
          defaultValue: false,
          label: "Stack Buttons Vertically on Tablet",
        },
      ],
    },
  ],
};
