import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid college email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z
    .string()
    .email("Enter a valid email")
    .refine(
      (val) => val.endsWith(".edu") || val.includes("college"),
      "Use your college email",
    ),
  phone: z.string().min(10, "Share a contact number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  collegeName: z.string().min(2, "Choose a college"),
  year: z.string().min(1, "Select your year"),
});

export const onboardingSchema = z.object({
  primaryGoal: z.enum(["academics", "job", "mental", "social"]),
  stressLevel: z.number().min(1).max(10),
  interests: z.array(z.string()).min(1, "Pick at least one interest"),
  overwhelmedRecently: z.boolean(),
});

