"use client";

import type { ContactFormBlock as ContactFormBlockType } from "@repo/types/payload";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "./contact-form-actions";

interface ContactFormBlockProps {
  block: ContactFormBlockType;
  contactEmail?: string;
}

export function ContactFormBlock({ block, contactEmail }: ContactFormBlockProps) {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  const recipientEmail = block.recipientEmail || contactEmail || "";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        const result = await submitContactForm({
          data: {
            name: value.name,
            email: value.email,
            message: value.message,
            recipientEmail,
          },
        });

        if (!result.success) {
          return {
            form: result.error || "Failed to send message. Please try again.",
          };
        }

        setSubmitStatus("success");
        return null;
      },
    },
  });

  if (submitStatus === "success") {
    return (
      <section className="py-12 md:py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-6 rounded-lg text-center">
              <p className="text-lg font-medium">{block.successMessage}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          {(block.title || block.description) && (
            <div className="text-center mb-8">
              {block.title && (
                <h2 className="text-3xl font-bold tracking-tight mb-4">{block.title}</h2>
              )}
              {block.description && typeof block.description === "string" && (
                <p className="text-muted-foreground">{block.description}</p>
              )}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="space-y-6">
              {/* Name Field */}
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="contact-name">
                      Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Your name"
                      required
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              {/* Email Field */}
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="contact-email">
                      Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="your@email.com"
                      required
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              {/* Message Field */}
              <form.Field name="message">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="contact-message">
                      Message <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Textarea
                      id="contact-message"
                      name="message"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Tell us how we can help..."
                      rows={6}
                      required
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              {/* Form-level errors */}
              <form.Subscribe selector={(state) => [state.errorMap]}>
                {([errorMap]) =>
                  errorMap?.onSubmit?.form ? (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                      {errorMap.onSubmit.form}
                    </div>
                  ) : null
                }
              </form.Subscribe>

              {/* Submit Button */}
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Sending..." : block.submitButtonText || "Send Message"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
