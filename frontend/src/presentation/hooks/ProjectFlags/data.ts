import { z } from "zod";

export const featureFlagFormSchema = z.object({
  description: z.string().trim().max(1000, "Description must be 1000 characters or less").optional(),
  name: z.string().trim().min(2, "Feature flag name must be at least 2 characters").max(160)
});

export const environmentFlagConfigSchema = z.object({
  enabled: z.boolean(),
  value: z.boolean()
});

export type EnvironmentFlagConfigFormValues = z.infer<typeof environmentFlagConfigSchema>;
export type FeatureFlagFormValues = z.infer<typeof featureFlagFormSchema>;
