import type { CollectionConfig } from "payload";
import {
  HeroBlock,
  DividerBlock,
  ThreeColumnCardBlock,
  FAQBlock,
  CTABlock,
  RichTextBlock,
  ImageVideoBlock,
  StatsBlock,
  FeatureHighlightBlock,
  TwoColumnBlock,
  GalleryBlock,
  ContactFormBlock,
  AccordionBlock,
  HeroOverlappingBlock,
  HowItWorksBlock,
  IconCardsBlock,
  FundraiserExamplesBlock,
  PricingBlock,
} from "../blocks";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => {
      return true;
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Page Title",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Page Slug",
      admin: {
        description:
          "URL path for the page. Can be with or without leading slash (e.g., 'about', 'pricing', or '/contact'). Use 'home' for the homepage.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Page Description",
    },
    {
      name: "blocks",
      type: "blocks",
      required: true,
      blocks: [
        HeroBlock,
        HeroOverlappingBlock,
        DividerBlock,
        ThreeColumnCardBlock,
        FAQBlock,
        AccordionBlock,
        CTABlock,
        RichTextBlock,
        ImageVideoBlock,
        StatsBlock,
        FeatureHighlightBlock,
        TwoColumnBlock,
        GalleryBlock,
        ContactFormBlock,
        HowItWorksBlock,
        IconCardsBlock,
        FundraiserExamplesBlock,
        PricingBlock,
      ],
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: false,
      label: "Published",
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Published At",
      admin: {
        description: "When this page was published",
      },
    },
  ],
  timestamps: true,
};
