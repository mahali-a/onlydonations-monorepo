import type { Block } from 'payload'

export const TwoColumnBlock: Block = {
  slug: 'two-column',
  interfaceName: 'TwoColumnBlock',
  labels: {
    singular: 'Two Column',
    plural: 'Two Columns',
  },
  fields: [
    {
      name: 'leftContent',
      type: 'group',
      label: 'Left Column',
      fields: [
        {
          name: 'contentType',
          type: 'select',
          required: true,
          options: [
            { label: 'Rich Text', value: 'text' },
            { label: 'Image/Video', value: 'media' },
          ],
          defaultValue: 'text',
          label: 'Content Type',
        },
        {
          name: 'text',
          type: 'richText',
          label: 'Text Content',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'text',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'media',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'Video URL',
          admin: {
            description: 'YouTube or Vimeo URL',
            condition: (_, siblingData) => siblingData?.contentType === 'media',
          },
        },
      ],
    },
    {
      name: 'rightContent',
      type: 'group',
      label: 'Right Column',
      fields: [
        {
          name: 'contentType',
          type: 'select',
          required: true,
          options: [
            { label: 'Rich Text', value: 'text' },
            { label: 'Image/Video', value: 'media' },
          ],
          defaultValue: 'media',
          label: 'Content Type',
        },
        {
          name: 'text',
          type: 'richText',
          label: 'Text Content',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'text',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'media',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'Video URL',
          admin: {
            description: 'YouTube or Vimeo URL',
            condition: (_, siblingData) => siblingData?.contentType === 'media',
          },
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light Gray', value: 'gray-light' },
        { label: 'Light Green', value: 'green-light' },
        { label: 'Primary', value: 'primary' },
      ],
      defaultValue: 'white',
      label: 'Background Color',
    },
    {
      name: 'responsive',
      type: 'group',
      label: 'Responsive Settings',
      fields: [
        {
          name: 'columnRatio',
          type: 'select',
          options: [
            { label: '50/50', value: '50-50' },
            { label: '60/40', value: '60-40' },
            { label: '40/60', value: '40-60' },
          ],
          defaultValue: '50-50',
          label: 'Desktop Column Ratio',
        },
        {
          name: 'reverseOrder',
          type: 'checkbox',
          defaultValue: false,
          label: 'Reverse Column Order',
          admin: {
            description: 'Useful for alternating layouts on multiple blocks',
          },
        },
        {
          name: 'stackMobile',
          type: 'checkbox',
          defaultValue: true,
          label: 'Stack Vertically on Mobile',
        },
        {
          name: 'gap',
          type: 'number',
          defaultValue: 32,
          label: 'Gap Between Columns (px)',
        },
      ],
    },
  ],
}
