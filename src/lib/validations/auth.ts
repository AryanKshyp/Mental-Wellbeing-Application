import * as z from "zod";

// --- CONSTANTS ---
export const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[0-9]{10}$/,
};

// Add your domains here
export const COLLEGE_DOMAINS = ["ac.in", "edu", "college.edu", "gmail.com"];

// --- 1. LOGIN SCHEMA ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- 2. SIGNUP SCHEMA (THIS IS THE MISSING PIECE) ---
export const signupSchema = z.object({
  // Account Details
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(PATTERNS.PHONE, "Phone number must be 10 digits"),
  collegeName: z.string().min(1, "College is required"),
  year: z.string().min(1, "Year is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  // Onboarding Details (Optional initially)
  primaryGoal: z.string().optional(),
  stressLevel: z.number().optional(),
  interests: z.array(z.string()).optional(),
  overwhelmedRecently: z.string().optional(),
});

// --- 3. ONBOARDING SCHEMA ---
export const onboardingSchema = z.object({
  primaryGoal: z.string().min(1, "Please select a goal"),
  stressLevel: z.number().min(1).max(10),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  overwhelmedRecently: z.string().optional(),
});

// --- EXPORT TYPES ---
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;