import type { ComponentType } from "react";
import type { EMAIL_TEMPLATES } from "./registry";

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES;

export type EmailTemplate<T> = {
  subject: string;
  schema: unknown;
  component: ComponentType<Omit<T, "email">>;
};

export type EmailTemplateData<T extends EmailTemplateType> =
  (typeof EMAIL_TEMPLATES)[T]["schema"] extends { parse: (data: any) => infer R } ? R : never;
