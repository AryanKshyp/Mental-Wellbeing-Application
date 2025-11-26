import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Welcome back</p>
        <h1 className="text-3xl font-semibold text-foreground">
          Log in to Campus Connect
        </h1>
        <p className="text-sm text-muted-foreground">
          Continue your wellness streaks and pick up chats where you left off.
        </p>
      </div>

      <AuthCard
        title="Enter your email"
        description="We’ll keep your experience synced across devices."
      >
        <div className="px-6 pb-6">
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-primary">
              Create your account
            </Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}

