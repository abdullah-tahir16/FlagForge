import { z } from "zod";

export const featureFlagFormSchema = z.object({
  description: z.string().trim().max(1000, "Description must be 1000 characters or less").optional(),
  name: z.string().trim().min(2, "Feature flag name must be at least 2 characters").max(160)
});

export const environmentFlagConfigSchema = z.object({
  enabled: z.boolean(),
  rolloutPercentage: z.coerce
    .number({ error: "Rollout percentage is required" })
    .int("Rollout percentage must be a whole number")
    .min(0, "Rollout percentage must be at least 0")
    .max(100, "Rollout percentage must be 100 or less"),
  value: z.boolean()
});

export type EnvironmentFlagConfigFormValues = z.infer<typeof environmentFlagConfigSchema>;
export type FeatureFlagFormValues = z.infer<typeof featureFlagFormSchema>;
