import type { Block } from "payload";

export const ThreeColumnCardBlock: Block = {
  slug: "three-column-card",
  interfaceName: "ThreeColumnCardBlock",
  labels: {
    singular: "Three Column Card",
    plural: "Three Column Cards",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Card Title",
    },
    {
      name: "subtitle",
      type: "text",
      label: "Card Subtitle",
    },
    {
      name: "columns",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 3,
      label: "Columns",
      fields: [
        {
          name: "columnTitle",
          type: "text",
          label: "Column Title",
        },
        {
          name: "rows",
          type: "array",
          label: "Rows",
          fields: [
            {
              name: "label",
              type: "text",
              label: "Left Label",
              required: true,
            },
            {
              name: "value",
              type: "text",
              label: "Right Value",
              required: true,
            },
            {
              name: "description",
              type: "richText",
              label: "Description (optional)",
            },
            {
              name: "tooltip",
              type: "text",
              label: "Tooltip Text (optional)",
            },
          ],
        },
      ],
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
          name: "desktopColumns",
          type: "select",
          options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
          ],
          defaultValue: "3",
          label: "Desktop Columns",
        },
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
            { label: "3 Columns", value: "3" },
          ],
          defaultValue: "1",
          label: "Mobile Columns",
        },
        {
          name: "gapDesktop",
          type: "number",
          defaultValue: 32,
          label: "Gap - Desktop (px)",
        },
        {
          name: "gapTablet",
          type: "number",
          defaultValue: 24,
          label: "Gap - Tablet (px)",
        },
        {
          name: "gapMobile",
          type: "number",
          defaultValue: 16,
          label: "Gap - Mobile (px)",
        },
      ],
    },
  ],
};
