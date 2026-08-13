import type { ZodSchema } from "zod";

type FormErrors = Record<string, string>;

export const validateWithSchema =
  (schema: ZodSchema) =>
  (values: Record<string, unknown>): FormErrors => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {};
    }

    return result.error.issues.reduce<FormErrors>((errors, issue) => {
      const key = issue.path[0];

      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }

      return errors;
    }, {});
  };
