import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contact-form',
  interfaceName: 'ContactFormBlock',
  labels: {
    singular: 'Contact Form',
    plural: 'Contact Forms',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Form Title',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Form Description',
    },
    {
      name: 'formFields',
      type: 'array',
      label: 'Form Fields',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Field Label',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Field Name (no spaces)',
          admin: {
            description: 'Used for form submission (e.g., first_name, email, message)',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'tel' },
            { label: 'Number', value: 'number' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Radio', value: 'radio' },
          ],
          defaultValue: 'text',
          label: 'Field Type',
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          label: 'Required Field',
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Placeholder Text',
        },
        {
          name: 'options',
          type: 'array',
          label: 'Options (for select/radio/checkbox)',
          admin: {
            condition: (_, siblingData) =>
              ['select', 'radio', 'checkbox'].includes(siblingData?.type),
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Option Label',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Option Value',
            },
          ],
        },
        {
          name: 'rows',
          type: 'number',
          label: 'Rows (for textarea)',
          defaultValue: 4,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'textarea',
          },
        },
      ],
    },
    {
      name: 'submitButtonText',
      type: 'text',
      defaultValue: 'Submit',
      label: 'Submit Button Text',
    },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Thank you for your message. We will get back to you soon!',
      label: 'Success Message',
    },
    {
      name: 'errorMessage',
      type: 'text',
      defaultValue: 'There was an error submitting the form. Please try again.',
      label: 'Error Message',
    },
    {
      name: 'recipientEmail',
      type: 'email',
      required: true,
      label: 'Recipient Email Address',
      admin: {
        description: 'Form submissions will be sent to this email',
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Single Column', value: 'single' },
        { label: 'Two Columns', value: 'two' },
      ],
      defaultValue: 'single',
      label: 'Form Layout',
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
      name: 'maxWidth',
      type: 'select',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Large (1200px)', value: 'large' },
        { label: 'Medium (900px)', value: 'medium' },
        { label: 'Small (600px)', value: 'small' },
      ],
      defaultValue: 'medium',
      label: 'Form Max Width',
    },
  ],
}
