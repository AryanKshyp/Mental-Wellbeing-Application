"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { SignupFormData, PATTERNS, COLLEGE_DOMAINS } from "@/lib/validations/auth";
import { signupAction } from "@/lib/actions/auth";
import { COLLEGE_OPTIONS } from "@/lib/constants";
import {
  User, Mail, Phone, School, BookOpen,
  ArrowRight, ArrowLeft, Check, AlertCircle, Loader2
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

// --- CONFIGURATION ---
const STEPS = [
  { id: "account", title: "Create your account", fields: ["fullName", "email", "phone", "collegeName", "year", "password"] },
  { id: "goal", title: "What brings you here?", fields: ["primaryGoal"] },
  { id: "stress", title: "Current stress level", fields: ["stressLevel"] },
  { id: "interests", title: "Pick your vibe", fields: ["interests"] },
  { id: "health", title: "Mental Health Check", fields: ["overwhelmedRecently"] },
] as const;

const GOALS = [
  { id: "academics", label: "Academics", blurb: "Coursework, labs, CGPA" },
  { id: "job", label: "Jobs & Internships", blurb: "Placements, networking" },
  { id: "mental", label: "Mental Health", blurb: "Stress, anxiety, burnout" },
  { id: "social", label: "Social Life", blurb: "Making friends, societies" },
];

const INTEREST_TAGS = [
  "Music 🎵", "Sports ⚽", "Tech 💻", "Art 🎨",
  "Travel ✈️", "Reading 📚", "Gaming 🎮", "Food 🍔",
  "Movies 🎬", "Photography 📷", "Writing ✍️", "Dancing 💃"
];

export function SignupForm() {
  const [step, setStep] = React.useState(0);
  const [customCollege, setCustomCollege] = React.useState("");
  // NEW: Local state to hold server errors
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SignupFormData & {
    primaryGoal: string;
    stressLevel: number;
    interests: string[];
    overwhelmedRecently: string;
  }>({
    shouldUseNativeValidation: true,
    mode: "onChange",
    defaultValues: {
      fullName: "", email: "", phone: "",
      collegeName: "", year: "", password: "",
      primaryGoal: "",
      stressLevel: 5,
      interests: [],
      overwhelmedRecently: "",
    },
  });

  const { trigger, handleSubmit, control, setError, clearErrors, watch, formState } = form;
  const { errors } = formState;

  const currentGoal = watch("primaryGoal");
  const currentStress = watch("stressLevel");
  const currentInterests = watch("interests") || [];
  const currentOverwhelmed = watch("overwhelmedRecently");

  const handleNext = async () => {
    // @ts-ignore 
    const fields = STEPS[step].fields;
    const valid = await trigger(fields as any);
    if (valid) {
      setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setServerError(null); // Reset error before trying

    let college = values.collegeName;
    if (college === "OTHER") {
      if (!customCollege.trim()) {
        setError("collegeName", { message: "Enter your college name" });
        setIsSubmitting(false);
        return;
      }
      college = customCollege.trim();
    }

    try {
      // Call Server Action
      const result = await signupAction({ ...values, collegeName: college });

      // If the server returns an error object, show it
      if (result?.error) {
        setServerError(result.error);
        setIsSubmitting(false);
      }
      // If no error, the redirect in auth.ts will handle the page change
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  const getBorderColor = (fieldName: string) => {
    return errors[fieldName as keyof typeof errors]
      ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
      : "border-gray-200";
  };

  return (
    <div className="w-full max-w-lg mx-auto h-full flex flex-col justify-center">

      {/* HEADER & PROGRESS */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          {STEPS[step].title}
        </h2>

        <div className="flex justify-between items-end mb-2">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">
            Step {step + 1} of {STEPS.length}
          </p>
          <span className="text-xs text-gray-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

          {/* ================= STEP 1: ACCOUNT DETAILS ================= */}
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <FormField
                control={control}
                name="fullName"
                rules={{ required: "Required", minLength: { value: 3, message: "Too short" }, pattern: { value: /^[a-zA-Z\s]+$/, message: "Letters only" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1 text-gray-600 font-medium">Full Name <span className="text-red-500">*</span></FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <FormControl>
                        <Input placeholder="Aarav Mehta" className={`pl-10 h-12 bg-white rounded-xl ${getBorderColor("fullName")}`} {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                rules={{ required: "Required", pattern: { value: PATTERNS.EMAIL, message: "Invalid email" }, validate: (v) => COLLEGE_DOMAINS.some((d) => v.toLowerCase().includes(d)) || "Invalid domain" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1 text-gray-600 font-medium">College Email <span className="text-red-500">*</span></FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <FormControl>
                        <Input type="email" placeholder="you@college.edu" className={`pl-10 h-12 bg-white rounded-xl ${getBorderColor("email")}`} {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="phone"
                rules={{ required: "Required", pattern: { value: /^[0-9]{10}$/, message: "10 digits" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1 text-gray-600 font-medium">Phone <span className="text-red-500">*</span></FormLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <FormControl>
                        <Input type="tel" placeholder="+91 9876543210" className={`pl-10 h-12 bg-white rounded-xl ${getBorderColor("phone")}`} {...field} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="collegeName"
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="ml-1 text-gray-600 font-medium">College <span className="text-red-500">*</span></FormLabel>
                    <div className="relative">
                      <School className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <FormControl>
                        <select
                          className={`flex h-12 w-full pl-10 items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm appearance-none ${getBorderColor("collegeName")}`}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value !== "OTHER") { setCustomCollege(""); clearErrors("collegeName"); }
                          }}
                        >
                          <option value="">Select Campus...</option>
                          {COLLEGE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                          <option value="OTHER">Other</option>
                        </select>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              {watch("collegeName") === "OTHER" && (
                <Input placeholder="Enter your college name" value={customCollege} required onChange={(e) => { setCustomCollege(e.target.value); if (e.target.value.length > 2) clearErrors("collegeName"); }} className="bg-sky-50 border-sky-200 h-11 rounded-xl" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="year"
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ml-1 text-gray-600 font-medium">Year <span className="text-red-500">*</span></FormLabel>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <FormControl>
                          <select className={`flex h-12 w-full pl-10 rounded-xl border bg-white px-3 py-2 text-sm appearance-none ${getBorderColor("year")}`} {...field}>
                            <option value="">Year...</option>
                            {["1st", "2nd", "3rd", "4th", "5th"].map(y => <option key={y} value={`${y} Year`}>{y} Year</option>)}
                          </select>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="password"
                  rules={{ required: "Required", minLength: 8 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="ml-1 text-gray-600 font-medium">Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className={`h-12 bg-white rounded-xl ${getBorderColor("password")}`} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* ================= STEP 2: PRIMARY GOAL ================= */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <FormField
                control={control}
                name="primaryGoal"
                rules={{ required: "Please select a goal" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 font-normal">Choose the option that resonates right now. <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="grid gap-3 sm:grid-cols-1 mt-2">
                        {GOALS.map((goal) => (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => field.onChange(goal.id)}
                            className={`rounded-2xl border p-4 text-left transition-all hover:border-sky-400 flex items-center gap-4 ${field.value === goal.id
                                ? "border-sky-500 bg-sky-50 ring-1 ring-sky-500"
                                : "border-gray-200 bg-white"
                              }`}
                          >
                            <div className={`p-3 rounded-full ${field.value === goal.id ? "bg-sky-200 text-sky-700" : "bg-gray-100 text-gray-500"}`}>
                              <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                            </div>
                            <div>
                              <p className="text-base font-bold text-gray-900">{goal.label}</p>
                              <p className="text-sm text-gray-500">{goal.blurb}</p>
                            </div>
                            {field.value === goal.id && <Check className="ml-auto text-sky-600" size={20} />}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ================= STEP 3: STRESS LEVEL ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <FormField
                control={control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 font-normal">
                      Slide to match the last few days (1 = Super Chill, 10 = Overwhelmed).
                    </FormLabel>
                    <FormControl>
                      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm mt-4">
                        <div className="flex justify-between items-end mb-6">
                          <span className="text-4xl font-black text-sky-600">{currentStress}</span>
                          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">/ 10 Scale</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <div className="flex justify-between mt-4 text-xs font-medium text-gray-400">
                          <span>Zen Mode 🧘</span>
                          <span>Panic Mode 🔥</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ================= STEP 4: INTERESTS ================= */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
              <FormField
                control={control}
                name="interests"
                rules={{ required: "Pick at least one vibe" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 font-normal">Select tags that describe you. <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 p-4 rounded-2xl border ${errors.interests ? "border-red-200 bg-red-50" : "border-transparent"}`}>
                        {INTEREST_TAGS.map((interest) => {
                          const isSelected = field.value?.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => {
                                const nextState = isSelected
                                  ? field.value.filter((i) => i !== interest)
                                  : [...(field.value || []), interest];
                                field.onChange(nextState);
                              }}
                              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${isSelected
                                  ? "bg-sky-500 text-white border-sky-600 shadow-md transform scale-105"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
                                }`}
                            >
                              {interest}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ================= STEP 5: OVERWHELMED CHECK ================= */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <FormField
                control={control}
                name="overwhelmedRecently"
                rules={{ required: "Please answer yes or no" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 font-normal block mb-4">
                      Have you felt overwhelmed in the last 2 weeks? <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        {["Yes", "No"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => field.onChange(option)}
                            className={`flex-1 py-6 rounded-2xl border-2 text-lg font-bold transition-all ${field.value === option
                                ? "border-sky-500 bg-sky-50 text-sky-700"
                                : `border-gray-100 bg-white text-gray-400 hover:border-sky-200 ${errors.overwhelmedRecently ? "border-red-200" : ""}`
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    {currentOverwhelmed === "Yes" && (
                      <div className="flex items-start gap-3 p-4 bg-orange-50 text-orange-800 rounded-xl text-sm mt-4 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="shrink-0" size={20} />
                        <p>It's okay to feel this way. We'll prioritize showing you support resources.</p>
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ================= SERVER ERROR MESSAGE ================= */}
          {serverError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle size={18} />
              <p>{serverError}</p>
            </div>
          )}

          {/* ================= NAVIGATION BUTTONS ================= */}
          <div className="pt-6 flex items-center justify-between gap-4 border-t border-gray-50 mt-4">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-900"
              >
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
            ) : (
              <div /> /* Spacer */
            )}

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 h-12 rounded-xl shadow-lg shadow-sky-500/25 transition-all"
              >
                Continue <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-10 h-12 rounded-xl shadow-xl shadow-sky-500/30 transition-all w-full md:w-auto flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? "Creating..." : "Complete Setup"}
              </Button>
            )}
          </div>

        </form>
      </Form>
    </div>
  );
}