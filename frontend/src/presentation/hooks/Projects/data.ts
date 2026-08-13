import { z } from "zod";

export const projectFormSchema = z.object({
  description: z.string().trim().max(1000, "Description must be 1000 characters or less").optional(),
  name: z.string().trim().min(2, "Project name must be at least 2 characters").max(160)
});

export const environmentFormSchema = z.object({
  name: z.string().trim().min(2, "Environment name must be at least 2 characters").max(120)
});

export type EnvironmentFormValues = z.infer<typeof environmentFormSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
