import type { ComponentType } from "react";
import type { ChangeEmailData } from "@/templates/change-email/schema";
import { changeEmailSchema } from "@/templates/change-email/schema";
import { ChangeEmailTemplate } from "@/templates/change-email/template";
import type { EmailOtpData } from "@/templates/email-otp/schema";
import { emailOtpSchema } from "@/templates/email-otp/schema";
import { EmailOtpTemplate } from "@/templates/email-otp/template";

type EmailTemplate<T> = {
  subject: string;
  schema: unknown;
  component: ComponentType<Omit<T, "email">>;
};

export const EMAIL_TEMPLATES = {
  "email-otp": {
    subject: "Your verification code",
    schema: emailOtpSchema,
    component: EmailOtpTemplate,
  } satisfies EmailTemplate<EmailOtpData>,
  "change-email": {
    subject: "Approve your email change",
    schema: changeEmailSchema,
    component: ChangeEmailTemplate,
  } satisfies EmailTemplate<ChangeEmailData>,
} as const;
