"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema } from "@/lib/validations/auth";
import { signupAction } from "@/lib/actions/auth";
import { COLLEGE_OPTIONS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SIGNUP_STEPS = [
  {
    title: "Your Basics",
    description: "Let mentors know how to address you.",
    fields: ["fullName", "email", "phone"] as const,
  },
  {
    title: "Campus Snapshot",
    description: "Tell us where you study and your current year.",
    fields: ["collegeName", "year", "password"] as const,
  },
];

type StepKey = (typeof SIGNUP_STEPS)[number]["fields"][number];

export function SignupForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(0);
  const [pending, startTransition] = React.useTransition();
  const [customCollege, setCustomCollege] = React.useState("");

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      collegeName: "",
      year: "",
      password: "",
    },
  });

  const currentStepFields = SIGNUP_STEPS[step].fields;

  const handleNext = async () => {
    const valid = await form.trigger(currentStepFields as StepKey[]);
    if (!valid) return;
    setStep((prev) => Math.min(prev + 1, SIGNUP_STEPS.length - 1));
  };

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    setError(null);
    startTransition(async () => {
      const result = await signupAction({
        ...values,
        collegeName: values.collegeName === "OTHER" ? customCollege : values.collegeName,
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Step {step + 1} of {SIGNUP_STEPS.length}
        </p>
        <h3 className="text-2xl font-semibold text-foreground">
          {SIGNUP_STEPS[step].title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {SIGNUP_STEPS[step].description}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
        >
          {step === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Aarav Mehta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@campus.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormDescription>
                      We only use this if mentors need to confirm a session.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="collegeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College</FormLabel>
                    <FormControl>
                      <>
                        <select
                          className="flex h-11 w-full rounded-xl border border-input bg-transparent px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value)}
                        >
                          <option value="">Choose a campus</option>
                          {COLLEGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          <option value="OTHER">Other (type manually)</option>
                        </select>
                        {field.value === "OTHER" && (
                          <Input
                            className="mt-3"
                            placeholder="Your college name"
                            value={customCollege}
                            onChange={(event) =>
                              setCustomCollege(event.target.value)
                            }
                          />
                        )}
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Year</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-11 w-full rounded-xl border border-input bg-transparent px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a strong password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use at least 8 characters with a mix of letters and numbers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={pending}
              >
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < SIGNUP_STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                {pending ? "Creating your space..." : "Create my account"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

