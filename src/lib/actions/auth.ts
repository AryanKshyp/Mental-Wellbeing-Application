"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  loginSchema,
  onboardingSchema,
  signupSchema,
} from "@/lib/validations/auth";

export async function loginAction(
  formData: z.infer<typeof loginSchema>,
): Promise<{ error?: string }> {
  const supabase = createServerSupabase();
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signupAction(
  formData: z.infer<typeof signupSchema>,
): Promise<{ error?: string }> {
  const supabase = createServerSupabase();
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        college_name: parsed.data.collegeName,
        year: parsed.data.year,
      },
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to create account" };
  }

  redirect("/login?checkInbox=1");
}

export async function onboardingAction(
  formData: z.infer<typeof onboardingSchema>,
): Promise<{ error?: string }> {
  const supabase = createServerSupabase();
  const parsed = onboardingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Please sign in to continue" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      goals: [parsed.data.primaryGoal],
      stress_level: parsed.data.stressLevel,
      interests: parsed.data.interests,
      felt_overwhelmed: parsed.data.overwhelmedRecently,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

