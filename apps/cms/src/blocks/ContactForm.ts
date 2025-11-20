import type { Block } from "payload";

export const ContactFormBlock: Block = {
  slug: "contact-form",
  interfaceName: "ContactFormBlock",
  labels: {
    singular: "Contact Form",
    plural: "Contact Forms",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Form Title",
      defaultValue: "Get in Touch",
    },
    {
      name: "description",
      type: "textarea",
      label: "Form Description",
      defaultValue: "Have questions? We're here to help.",
    },
    {
      name: "submitButtonText",
      type: "text",
      defaultValue: "Send Message",
      label: "Submit Button Text",
    },
    {
      name: "successMessage",
      type: "text",
      defaultValue: "Thank you for your message. We'll get back to you soon!",
      label: "Success Message",
    },
    {
      name: "recipientEmail",
      type: "email",
      label: "Recipient Email (optional)",
      admin: {
        description: "Override recipient. Leave blank to use Settings contact email.",
      },
    },
  ],
};
