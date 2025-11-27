"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/lib/validations/auth";
import { onboardingAction } from "@/lib/actions/auth";
import { INTEREST_TAGS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const GOALS = [
  { id: "academics", label: "Academics", blurb: "Coursework, labs, CGPA" },
  { id: "job", label: "Jobs & Internships", blurb: "Placements, networking" },
  { id: "mental", label: "Mental Health", blurb: "Stress, anxiety, burnout" },
  { id: "social", label: "Social Life", blurb: "Making friends, societies" },
] as const;

export function OnboardingForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      primaryGoal: "academics",
      stressLevel: 5,
      interests: [],
      overwhelmedRecently: false,
    },
  });

  const onSubmit = (values: z.infer<typeof onboardingSchema>) => {
    setError(null);
    startTransition(async () => {
      const result = await onboardingAction(values);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="primaryGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What brings you to Campus Connect?</FormLabel>
              <FormDescription>
                Choose the option that resonates right now—you can always change it later.
              </FormDescription>
              <FormControl>
                <div className="grid gap-3 sm:grid-cols-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => field.onChange(goal.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition hover:border-primary",
                        field.value === goal.id
                          ? "border-primary bg-primary/5"
                          : "border-border",
                      )}
                    >
                      <p className="text-base font-semibold">{goal.label}</p>
                      <p className="text-sm text-muted-foreground">{goal.blurb}</p>
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stressLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current stress level</FormLabel>
              <FormDescription>
                Slide to match the last few days (1 = super chill, 10 = overwhelmed).
              </FormDescription>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    min={1}
                    max={10}
                  />
                  <p className="text-sm font-semibold">{field.value}/10</p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pick your vibe</FormLabel>
              <FormDescription>
                We use this to recommend mentors, communities, and challenges.
              </FormDescription>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {INTEREST_TAGS.map((interest) => {
                  const checked = field.value?.includes(interest);
                  return (
                    <label
                      key={interest}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium",
                        checked
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(state) => {
                          const nextState =
                            state === true
                              ? [...(field.value ?? []), interest]
                              : (field.value ?? []).filter((item) => item !== interest);
                          field.onChange(nextState);
                        }}
                      />
                      {interest}
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overwhelmedRecently"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Felt overwhelmed in the last 2 weeks?</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  {["Yes", "No"].map((label) => {
                    const value = label === "Yes";
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                          field.value === value
                            ? "border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving your preferences..." : "Take me to the dashboard"}
        </Button>
      </form>
    </Form>
  );
}

