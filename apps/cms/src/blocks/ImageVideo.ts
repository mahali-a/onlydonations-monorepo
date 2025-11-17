import type { Block } from "payload";

export const ImageVideoBlock: Block = {
  slug: "image-video",
  interfaceName: "ImageVideoBlock",
  labels: {
    singular: "Image/Video",
    plural: "Images/Videos",
  },
  fields: [
    {
      name: "mediaType",
      type: "select",
      required: true,
      options: [
        { label: "Image", value: "image" },
        { label: "Video (YouTube/Vimeo)", value: "video" },
      ],
      defaultValue: "image",
      label: "Media Type",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Image",
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === "image",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      label: "Video URL",
      admin: {
        description: "YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=...)",
        condition: (_, siblingData) => siblingData?.mediaType === "video",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Caption",
    },
    {
      name: "altText",
      type: "text",
      label: "Alt Text (for accessibility)",
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
      label: "Alignment",
    },
    {
      name: "width",
      type: "select",
      options: [
        { label: "Full Width", value: "full" },
        { label: "Large (90%)", value: "large" },
        { label: "Medium (75%)", value: "medium" },
        { label: "Small (50%)", value: "small" },
      ],
      defaultValue: "large",
      label: "Width",
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
