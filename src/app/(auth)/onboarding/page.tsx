import { AuthCard } from "@/components/layout/auth-card";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Step 2/2</p>
        <h1 className="text-3xl font-semibold text-foreground">
          Personalize your Campus Connect feed
        </h1>
        <p className="text-sm text-muted-foreground">
          These responses help us match you with mentors, communities, and Gemini prompts.
        </p>
      </div>

      <AuthCard
        title="Tell us how you’re really doing"
        description="The more honest you are, the better support feels."
      >
        <div className="px-6 pb-6">
          <OnboardingForm />
        </div>
      </AuthCard>
    </div>
  );
}

