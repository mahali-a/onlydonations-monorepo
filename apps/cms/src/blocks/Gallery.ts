import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Gallery Title',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Gallery Description',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: 'Masonry', value: 'masonry' },
      ],
      defaultValue: '3',
      label: 'Desktop Layout',
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Lightbox (click to expand)',
    },
    {
      name: 'responsive',
      type: 'group',
      label: 'Responsive Settings',
      fields: [
        {
          name: 'tabletColumns',
          type: 'select',
          options: [
            { label: '1 Column', value: '1' },
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: 'Masonry', value: 'masonry' },
          ],
          defaultValue: '2',
          label: 'Tablet Layout',
        },
        {
          name: 'mobileColumns',
          type: 'select',
          options: [
            { label: '1 Column', value: '1' },
            { label: '2 Columns', value: '2' },
            { label: 'Masonry', value: 'masonry' },
          ],
          defaultValue: '1',
          label: 'Mobile Layout',
        },
        {
          name: 'gap',
          type: 'number',
          defaultValue: 16,
          label: 'Gap Between Images (px)',
        },
      ],
    },
  ],
}
