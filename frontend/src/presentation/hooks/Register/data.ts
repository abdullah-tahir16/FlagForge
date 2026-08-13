import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  organizationName: z.string().trim().min(2, "Organization name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
