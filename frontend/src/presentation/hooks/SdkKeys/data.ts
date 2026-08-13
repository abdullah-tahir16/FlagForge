import { z } from "zod";

export const sdkKeyFormSchema = z.object({
  name: z.string().trim().min(2, "SDK key name must be at least 2 characters").max(120)
});

export type SdkKeyFormValues = z.infer<typeof sdkKeyFormSchema>;
