import type { CollectionConfig } from 'payload'
import {
  HeroBlock,
  DividerBlock,
  ThreeColumnCardBlock,
  CalculatorBlock,
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
} from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return true
      }
      return {
        published: {
          equals: true,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Page Slug',
      admin: {
        description: 'Used for page routing (e.g., /pricing, /about, /how-it-works)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Page Description',
    },
    {
      name: 'blocks',
      type: 'blocks',
      required: true,
      blocks: [
        HeroBlock,
        DividerBlock,
        ThreeColumnCardBlock,
        CalculatorBlock,
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
      ],
    },
    // SEO Fields
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Recommended: 50-60 characters',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Recommended: 150-160 characters',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords (comma-separated)',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Open Graph Image',
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published At',
      admin: {
        description: 'When this page was published',
      },
    },
  ],
  timestamps: true,
}
