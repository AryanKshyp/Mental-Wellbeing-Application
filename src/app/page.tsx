import Link from "next/link";
import { ArrowRight, HeartHandshake, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURE_HIGHLIGHTS = [
  {
    title: "TalkSpace Rooms",
    description:
      "Anonymous community spaces moderated by senior mentors & counselors.",
  },
  {
    title: "Mentor Matching",
    description:
      "Gemini-powered routing pairs you with seniors, alumni, or professors.",
  },
  {
    title: "AI Buddy",
    description:
      "An empathetic chat companion trained on your journals and goals.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              Built for campus wellbeing
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Campus Connect helps students find mentors, feel heard, and build habits that stick.
            </h1>
            <p className="text-lg text-slate-600">
              One calming home for mental wellness check-ins, mentorship, journaling, and an AI buddy that remembers your story.
              Deploy-ready on Vercel’s free tier.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start free onboarding
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-rose-400" />
                Peer mentors verified
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Gemini-integrated
              </div>
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-sky-400" />
                Calming blue palette
              </div>
            </div>
          </div>
          <div className="rounded-[32px] border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-100/60">
            <div className="rounded-[28px] bg-gradient-to-br from-sky-400 via-teal-400 to-indigo-500 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Snapshot
              </p>
              <h3 className="mt-4 text-3xl font-semibold">
                “I connected with Prof. Liang in 5 minutes. She helped me manage exam stress and plan my week.”
              </h3>
              <p className="mt-4 text-sm text-white/80">— Kriti, 3rd year ECE</p>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Mentors online
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">17</p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Community vibe
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  Chill & supportive
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-primary/5"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {feature.title}
              </p>
              <p className="mt-3 text-base text-slate-600">{feature.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
