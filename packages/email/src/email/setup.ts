import React from "react";
import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";
import { EMAIL_TEMPLATES } from "./registry";
import type { EmailTemplateData, EmailTemplateType } from "./types";

let resendInstance: Resend | null = null;
let emailFrom: string | null = null;
let isDev: boolean = false;

export function initEmail(apiKey: string, from: string, options?: { isDev?: boolean }): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
    emailFrom = from;
    isDev = options?.isDev ?? false;
  }
  return resendInstance;
}

/** Get initialized Resend instance */
export function getEmail(): Resend {
  if (!resendInstance) {
    throw new Error("Resend has not been initialized. Call initEmail() first.");
  }
  return resendInstance;
}

/** Send type-safe email using template registry */
export async function sendEmail<T extends EmailTemplateType>(
  templateId: T,
  data: EmailTemplateData<T>,
): Promise<CreateEmailResponse> {
  const template = EMAIL_TEMPLATES[templateId];
  const validated = template.schema.parse(data);
  const { email, ...props } = validated as {
    email: string;
    [key: string]: unknown;
  };

  if (isDev) {
    console.log("\n[EMAIL DEV MODE]");
    console.log("Template:", templateId);
    console.log("To:", email);
    console.log("Subject:", template.subject);
    console.log("Data:", JSON.stringify(props, null, 2));
    console.log("---\n");

    return {
      id: "dev-mode",
      data: null,
      error: null,
    } as unknown as CreateEmailResponse;
  }

  const resend = getEmail();

  if (!emailFrom) {
    throw new Error("Email from address not set. Call initEmail() first.");
  }

  return resend.emails.send({
    from: emailFrom,
    to: [email],
    subject: template.subject,
    react: React.createElement(
      template.component as React.ComponentType<Record<string, unknown>>,
      props as Record<string, unknown>,
    ),
  });
}
