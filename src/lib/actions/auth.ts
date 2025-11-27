"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
// This import will now work because we fixed Step 1
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import type { z } from "zod";

// --- LOGIN ---
export async function loginAction(formData: z.infer<typeof loginSchema>) {
  const supabase = createServerSupabase();
  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) return { error: "Invalid login data" };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

// --- SIGNUP ---
export async function signupAction(formData: z.infer<typeof signupSchema>) {
  const supabase = createServerSupabase();

  // This line was crashing because signupSchema was undefined. It should work now.
  const parsed = signupSchema.safeParse(formData);

  if (!parsed.success) return { error: "Invalid form data" };

  const data = parsed.data;

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone,
        college_name: data.collegeName,
        year: data.year,
        primary_goal: data.primaryGoal,
        stress_level: data.stressLevel,
        interests: data.interests,
        felt_overwhelmed: data.overwhelmedRecently,
      },
    },
  });

  if (error || !authData.user) {
    return { error: error?.message ?? "Unable to create account" };
  }

  redirect("/dashboard");
}