"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "buddy";
  content: string;
};

const JOURNAL_SUMMARIES = [
  "Felt calmer after blocking Sundays for deep rest.",
  "Noticed that reaching out to roommates reduced rumination.",
  "Need consistent sleep before labs to avoid anxiety spikes.",
];

export default function BuddyPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "buddy",
      content:
        "Hey! I still remember your goal to keep exams from hijacking weekends. What’s the emotional weather like today?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Placeholder: replace with server action calling Gemini.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const buddyMsg: Message = {
      id: crypto.randomUUID(),
      role: "buddy",
      content:
        "Thanks for opening up. Let’s anchor on one calming ritual tonight. Maybe revisit your gratitude voice note?",
    };

    setMessages((prev) => [...prev, buddyMsg]);
    setLoading(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4 border-sky-100">
        <CardHeader>
          <Badge variant="outline" className="w-fit border-sky-200 text-sky-600">
            Context the AI sees
          </Badge>
          <CardTitle>Personalization snapshot</CardTitle>
          <p className="text-sm text-muted-foreground">
            AI Buddy only sees what you allow. Nothing from this chat is stored.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-semibold text-slate-900">Profile cues</p>
            <p>Year: 3rd • College: Springfield University • Stress: 7/10</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-semibold text-slate-900">Recent journal themes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {JOURNAL_SUMMARIES.map((summary) => (
                <li key={summary}>{summary}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-emerald-900">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Privacy promise
            </p>
            <p className="text-xs text-emerald-900/80">
              Messages stay on the client. Close the tab and it’s gone.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col border-slate-100">
        <CardHeader>
          <CardTitle>AI Buddy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your empathetic co-regulation partner powered by Google Gemini.
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <ScrollArea className="mb-4 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "buddy" ? "text-left" : "text-right"}
                >
                  <div
                    className={
                      message.role === "buddy"
                        ? "inline-block rounded-3xl rounded-tl-lg bg-white px-4 py-3 text-slate-700 shadow-sm"
                        : "inline-block rounded-3xl rounded-tr-lg bg-primary px-4 py-3 text-sm text-primary-foreground"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <p className="text-center text-xs text-muted-foreground">
                  Gemini is thinking...
                </p>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSend} className="space-y-3">
            <Textarea
              placeholder="Type what’s on your mind. Nothing is saved."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost">
                Clear
              </Button>
              <Button type="submit" disabled={loading || !input.trim()}>
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

