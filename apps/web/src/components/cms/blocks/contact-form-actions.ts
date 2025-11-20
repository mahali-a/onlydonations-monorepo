import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logger } from "@/lib/logger";

const contactLogger = logger.createChildLogger("contact-form");

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  recipientEmail: z.string().email(),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator(contactFormSchema)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Data is already validated by inputValidator
      const { name, email, message, recipientEmail } = data;

      // TODO: Implement email sending logic here
      // For now, just log the submission
      contactLogger.info("contact_form.submitted", {
        from: email,
        to: recipientEmail,
        name,
        messageLength: message.length,
      });

      // You can integrate with an email service like:
      // - Resend (resend.com)
      // - Postmark
      // - SendGrid
      // - AWS SES
      // Example with Resend:
      // await resend.emails.send({
      //   from: 'noreply@yourdomain.com',
      //   to: recipientEmail,
      //   subject: `New contact form submission from ${name}`,
      //   html: `
      //     <h2>New Contact Form Submission</h2>
      //     <p><strong>From:</strong> ${name} (${email})</p>
      //     <p><strong>Message:</strong></p>
      //     <p>${message}</p>
      //   `,
      // });

      return {
        success: true,
      };
    } catch (error) {
      contactLogger.error("contact_form.submission_failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        error: "Failed to send message. Please try again later.",
      };
    }
  });
