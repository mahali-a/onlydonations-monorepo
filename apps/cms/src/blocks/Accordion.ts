import type { Block } from "payload";

export const AccordionBlock: Block = {
  slug: "accordion",
  interfaceName: "AccordionBlock",
  labels: {
    singular: "Accordion",
    plural: "Accordions",
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
      name: "items",
      type: "array",
      label: "Accordion Items",
      minRows: 1,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Item Title",
        },
        {
          name: "content",
          type: "richText",
          required: true,
          label: "Item Content",
        },
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
          label: "Icon (optional)",
        },
      ],
    },
    {
      name: "allowMultipleOpen",
      type: "checkbox",
      defaultValue: false,
      label: "Allow Multiple Items Open",
      admin: {
        description: "If unchecked, only one item can be open at a time",
      },
    },
    {
      name: "defaultOpenIndex",
      type: "number",
      defaultValue: 0,
      label: "Default Open Item (index)",
      admin: {
        description: "Which item should be open by default (0 = first item, -1 = none)",
      },
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
          name: "maxWidth",
          type: "select",
          options: [
            { label: "Full Width", value: "full" },
            { label: "Large (1200px)", value: "large" },
            { label: "Medium (900px)", value: "medium" },
            { label: "Small (600px)", value: "small" },
          ],
          defaultValue: "large",
          label: "Max Width",
        },
      ],
    },
  ],
};
