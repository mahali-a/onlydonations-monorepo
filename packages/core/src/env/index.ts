import type { ZodError, z } from "zod";

export function validateEnv<T extends z.ZodType>(
  schema: T,
  env: unknown,
  appName: string,
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = formatZodErrors(result.error);
    const message = `Invalid environment variables in ${appName}:\n${errors}`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n");
}
