import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
      return !!user
    },
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'OnlyDonations',
      label: 'Site Name',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Site Description',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact Email',
    },
    {
      name: 'supportPhone',
      type: 'text',
      label: 'Support Phone',
    },
    // Fee Configuration
    {
      name: 'feeConfiguration',
      type: 'group',
      label: 'Fee Configuration',
      fields: [
        {
          name: 'creationFee',
          type: 'number',
          required: true,
          defaultValue: 0,
          label: 'Fee to Create Fundraiser (GHS)',
          admin: {
            description: 'No upfront fee to create a fundraiser',
          },
        },
        {
          name: 'transactionFeePercentage',
          type: 'number',
          required: true,
          defaultValue: 1.95,
          label: 'Transaction Fee - All Payment Methods (%)',
          admin: {
            description: 'Paystack fee charged on each donation (1.95% for all payment methods)',
          },
        },
        {
          name: 'donorContributionPercentage',
          type: 'number',
          defaultValue: 0,
          label: 'Your Cut on Transactions (%)',
          admin: {
            description: 'Optional cut you take on each transaction (currently 0%)',
          },
        },
        {
          name: 'withdrawalFees',
          type: 'array',
          label: 'Withdrawal/Transfer Fees',
          admin: {
            description: 'Fees charged when fundraiser withdraws funds (payment processor fees only)',
          },
          dbName: 'withdrawal_fees',
          fields: [
            {
              name: 'method',
              type: 'select',
              required: true,
              options: [
                { label: 'Mobile Money', value: 'mobile_money' },
                { label: 'Bank Account', value: 'bank_account' },
              ],
              label: 'Withdrawal Method',
              dbName: 'withdraw_method',
            },
            {
              name: 'type',
              type: 'select',
              required: true,
              options: [
                { label: 'Flat Fee (GHS)', value: 'flat' },
                { label: 'Percentage (%)', value: 'percentage' },
              ],
              label: 'Fee Type',
              dbName: 'fee_type',
            },
            {
              name: 'feeAmount',
              type: 'number',
              required: true,
              label: 'Fee Amount',
              admin: {
                description: 'Enter amount in GHS for flat fees, or percentage for percentage fees',
              },
            },
            {
              name: 'description',
              type: 'text',
              label: 'Description (optional)',
            },
          ],
        },
      ],
    },
    // Navigation
    {
      name: 'navigation',
      type: 'group',
      label: 'Navigation',
      fields: [
        {
          name: 'mainNav',
          type: 'array',
          label: 'Main Navigation (Left + Right)',
          admin: {
            description: 'Items will display left/right based on position setting',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Menu Item Label',
            },
            {
              name: 'position',
              type: 'select',
              required: true,
              options: [
                { label: 'Left (before logo)', value: 'left' },
                { label: 'Right (after logo)', value: 'right' },
              ],
              defaultValue: 'left',
              label: 'Position',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL (if no dropdown)',
            },
            {
              name: 'hasDropdown',
              type: 'checkbox',
              defaultValue: false,
              label: 'Has Dropdown Menu',
            },
            {
              name: 'dropdownItems',
              type: 'array',
              label: 'Dropdown Items',
              admin: {
                condition: (_, siblingData) => siblingData?.hasDropdown === true,
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'Item Label',
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'URL',
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Description',
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Icon (optional)',
                },
              ],
            },
            {
              name: 'isButton',
              type: 'checkbox',
              defaultValue: false,
              label: 'Render as Button',
              admin: {
                description: 'For CTA items like "Start a Fundraiser"',
                condition: (_, siblingData) => !siblingData?.hasDropdown,
              },
            },
          ],
        },
        {
          name: 'footerNav',
          type: 'array',
          label: 'Footer Navigation',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Label',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
            {
              name: 'target',
              type: 'select',
              options: [
                { label: 'Same Window', value: '_self' },
                { label: 'New Window', value: '_blank' },
              ],
              defaultValue: '_self',
              label: 'Target',
            },
          ],
        },
      ],
    },
    // Footer Content
    {
      name: 'footerContent',
      type: 'group',
      label: 'Footer Content',
      fields: [
        {
          name: 'copyright',
          type: 'text',
          label: 'Copyright Text',
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Media Links',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Twitter', value: 'twitter' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'GitHub', value: 'github' },
              ],
              required: true,
              label: 'Platform',
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'Profile URL',
            },
          ],
        },
      ],
    },
    // Branding
    {
      name: 'branding',
      type: 'group',
      label: 'Branding',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
        },
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color (hex)',
          admin: {
            description: 'e.g., #4CAF50',
          },
        },
      ],
    },
  ],
}
