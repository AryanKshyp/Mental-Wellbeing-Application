import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Step 1/2</p>
        <h1 className="text-3xl font-semibold text-foreground">
          Create your Campus Connect profile
        </h1>
        <p className="text-sm text-muted-foreground">
          We’ll use this info to tailor mentors, TalkSpace rooms, and AI support.
        </p>
      </div>

      <AuthCard
        title="Let’s get to know you"
        description="It only takes ~60 seconds."
      >
        <div className="px-6 pb-6">
          <SignupForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}

