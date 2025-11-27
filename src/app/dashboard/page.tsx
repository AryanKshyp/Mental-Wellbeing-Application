import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HABIT_IDEAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, Timer } from "lucide-react";

const FEATURE_SLIDES = [
  {
    title: "Habit Tracker",
    description: "Stack micro-habits and keep a mindful streak going.",
    accent: "Create routines that actually feel doable.",
  },
  {
    title: "TalkSpace",
    description: "Drop into moderated rooms when campus life feels loud.",
    accent: "Anonymous by default, empathetic by design.",
  },
  {
    title: "AI Buddy",
    description: "A Gemini-powered friend who remembers your journals.",
    accent: "Grounded, human, and hyper-personalized.",
  },
];

const QUICK_STATS = [
  { label: "Daily mood check-ins", value: "Completed", icon: Sparkles },
  { label: "Habit streak", value: "5 days", icon: Flame },
  { label: "Upcoming mentor chat", value: "Today, 6 PM", icon: Timer },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card className="bg-gradient-to-br from-white to-sky-50">
          <CardHeader>
            <CardDescription>Hey there 👋</CardDescription>
            <CardTitle className="text-3xl">
              You’ve shown up for yourself 5 days in a row.
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            {QUICK_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
                <stat.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-semibold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Up next</CardDescription>
            <CardTitle>Mentor sync with Sara</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share how your exam prep is going and update your goals so she can unblock you faster.
            </p>
            <Button className="w-full">Open chat</Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardDescription>Feature spotlight</CardDescription>
            <CardTitle>What’s brewing this week</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {FEATURE_SLIDES.map((slide) => (
              <div
                key={slide.title}
                className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-primary">{slide.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{slide.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">{slide.accent}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Habit tracker</CardDescription>
            <CardTitle>Daily rituals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {HABIT_IDEAS.map((habit) => (
              <label
                key={habit}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <Checkbox />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{habit}</p>
                  <p className="text-xs text-muted-foreground">Tap to mark complete</p>
                </div>
              </label>
            ))}
            <Button variant="outline" className="w-full">
              New habit
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Goal focus</CardDescription>
            <CardTitle>Stabilize academic stress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Block deep work slots", "Post updates in Academic Stress room", "Journal before bedtime"].map(
              (task) => (
                <div
                  key={task}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm"
                >
                  <span>{task}</span>
                  <Badge variant="outline">Today</Badge>
                </div>
              ),
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Gemini mood pulse</CardDescription>
            <CardTitle>Balanced • 7.2 / 10</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Based on yesterday’s journal and AI Buddy chat, Gemini senses cautious optimism. Keep celebrating small wins!
            </p>
            <div className={cn("rounded-2xl bg-gradient-to-r from-sky-100 to-emerald-100 p-4 text-slate-700")}>
              “Your tone brightened when you talked about community support. Maybe nudge yourself to join the 7 PM TalkSpace room.”
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}