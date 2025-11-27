"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/validations/auth";
import { loginAction } from "@/lib/actions/auth";

import {
  Mail, Lock, Loader2, AlertCircle
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // 🔥 CHANGE: match SignupForm behaviour → onChange + native errors
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    shouldUseNativeValidation: true,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState } = form;
  const { errors } = formState;

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await loginAction(values);

      // 🔥 SAME AS SignupForm
      if (result?.error) {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getBorderColor = (
    fieldName: keyof z.infer<typeof loginSchema>
  ) => {
    return errors[fieldName]
      ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
      : "border-gray-200";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* EMAIL FIELD */}
        <FormField
          control={form.control}
          name="email"
          // 🔥 ADD rules (same as Signup style)
          rules={{
            required: "Required",
            pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1 text-gray-600 font-medium">
                College Email
              </FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    autoComplete="email"
                    className={`pl-10 h-12 bg-white rounded-xl transition-all ${getBorderColor("email")}`}
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {/* PASSWORD FIELD */}
        <FormField
          control={form.control}
          name="password"
          rules={{
            required: "Required",
            minLength: { value: 6, message: "Password too short" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="ml-1 text-gray-600 font-medium">
                Password
              </FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`pl-10 h-12 bg-white rounded-xl transition-all ${getBorderColor("password")}`}
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {/* SERVER ERROR BANNER */}
        {serverError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle size={18} className="shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg shadow-sky-500/20 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            "Enter Campus Connect"
          )}
        </Button>

      </form>
    </Form>
  );
}
