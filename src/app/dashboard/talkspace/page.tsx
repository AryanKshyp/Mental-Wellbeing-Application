"use client";

import * as React from "react";
import { COMMUNITY_ROOMS, MENTOR_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, UsersRound } from "lucide-react";
import Link from "next/link";

const RECOMMENDED_MENTORS = [
  {
    name: "Sara Menon",
    role: "Senior • CS",
    tag: "Academic Stress",
    bio: "Helps with lab scheduling and overwhelm planning.",
  },
  {
    name: "Arjun Patel",
    role: "Alumni • Product Manager",
    tag: "Career Clarity",
    bio: "Great for resume rewrites and pivot conversations.",
  },
  {
    name: "Dr. Mei Liang",
    role: "Professor • Psychology",
    tag: "Emotional Balance",
    bio: "Mindfulness-first strategies to soften burnout.",
  },
];

export default function TalkspacePage() {
  const [prompt, setPrompt] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleMatch = async () => {
    setLoading(true);
    // This will later call a server action that hits Gemini + Supabase.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-sky-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardDescription>Community section</CardDescription>
              <CardTitle>TalkSpace Rooms</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {COMMUNITY_ROOMS.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900">
                    {room.name}
                  </p>
                  <UsersRound className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {room.description}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/dashboard/talkspace?room=${room.id}`}>
                    Enter room
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Habitual check-in</CardDescription>
            <CardTitle>Share anonymously</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Each room is moderated by trained seniors and uses Supabase Realtime for instant updates.
            </p>
            <Button variant="secondary" className="w-full">
              Host a pop-up room
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardDescription>Active chats</CardDescription>
            <CardTitle>Your mentors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MENTOR_CATEGORIES.map((category) => (
              <div
                key={category.label}
                className="rounded-2xl border border-slate-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {category.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <Badge variant="outline">2 chats</Badge>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-3">
                  <Avatar>
                    <AvatarFallback>
                      {category.label.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Next up: {category.label === "Seniors" ? "Sara" : category.label === "Alumni" ? "Arjun" : "Dr. Liang"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reply within 3 min • Typing…
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="ml-auto rounded-full">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardDescription>Mentorship matcher</CardDescription>
            <CardTitle>Tell us what’s on your mind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Eg. “I’m juggling final-year project + internship hunt and it’s frying my brain.”"
            />
            <p className="text-xs text-muted-foreground">
              Gemini analyses the intent (academic vs emotional vs career) and filters Supabase mentors within a second.
            </p>
            <Button
              disabled={loading || prompt.length < 10}
              onClick={handleMatch}
              className="w-full"
            >
              {loading ? "Asking Gemini..." : "Find the best mentors"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span className="sr-only">Open matcher</span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We found the best people for you</DialogTitle>
            <DialogDescription>
              Based on your note, we’re prioritizing balanced academic + wellbeing mentors.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            {RECOMMENDED_MENTORS.map((mentor) => (
              <div
                key={mentor.name}
                className="rounded-2xl border border-slate-100 bg-white p-4"
              >
                <p className="text-base font-semibold text-slate-900">
                  {mentor.name}
                </p>
                <p className="text-xs text-muted-foreground">{mentor.role}</p>
                <Badge variant="outline" className="mt-3">
                  {mentor.tag}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mentor.bio}
                </p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="w-full">Start chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

