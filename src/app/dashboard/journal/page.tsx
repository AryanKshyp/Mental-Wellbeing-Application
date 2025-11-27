"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mic } from "lucide-react";

type JournalEntry = {
  id: string;
  content: string;
  moodScore: number;
  createdAt: string;
};

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    content: "Felt overwhelmed with project reviews, but lab partner helped. Reminded myself to breathe before presenting.",
    moodScore: 6,
    createdAt: "Today • 8:30 AM",
  },
  {
    id: "2",
    content: "TalkSpace room actually helped me vent. Need to keep that habit.",
    moodScore: 7,
    createdAt: "Yesterday • 11:45 PM",
  },
];

export default function JournalPage() {
  const [entry, setEntry] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [entries, setEntries] = React.useState<JournalEntry[]>(MOCK_ENTRIES);
  const [recording, setRecording] = React.useState(false);

  const handleSave = async () => {
    if (!entry.trim()) return;
    setSaving(true);

    // Placeholder: call Gemini for mood score + Supabase insert.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const moodScore = Math.min(10, Math.max(1, 7 + Math.floor(Math.random() * 3) - 1));
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content: entry.trim(),
      moodScore,
      createdAt: "Just now",
    };

    setEntries((prev) => [newEntry, ...prev]);
    setEntry("");
    setSaving(false);
  };

  const toggleRecording = () => {
    setRecording((prev) => !prev);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-primary/20">
        <CardHeader>
          <CardDescription>Daily journal</CardDescription>
          <CardTitle>Write or speak freely</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type how today really felt..."
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant={recording ? "destructive" : "secondary"} onClick={toggleRecording}>
              <Mic className="mr-2 h-4 w-4" />
              {recording ? "Stop recording" : "Start recording"}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!entry.trim() || saving}
            >
              {saving ? "Analyzing with Gemini..." : "Save & analyze mood"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Voice recording happens via the Web Speech API in the browser. Audio is optional and stays in your Supabase bucket if you choose to save it.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Recent entries</CardDescription>
          <CardTitle>Gemini mood scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1 border-emerald-200 text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Mood {item.moodScore}/10
                </Badge>
                <p className="text-xs text-muted-foreground">{item.createdAt}</p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

