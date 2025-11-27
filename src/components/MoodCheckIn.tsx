'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Frown, Meh, Laugh, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type MoodCheckin = {
  id: string;
  user_id: string;
  mood: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

const MOOD_EMOJIS = [
  { id: 1, icon: <Frown className="h-8 w-8" />, label: 'Awful', value: 1 },
  { id: 2, icon: <Frown className="h-8 w-8" />, label: 'Bad', value: 2 },
  { id: 3, icon: <Meh className="h-8 w-8" />, label: 'Neutral', value: 3 },
  { id: 4, icon: <Smile className="h-8 w-8" />, label: 'Good', value: 4 },
  { id: 5, icon: <Laugh className="h-8 w-8" />, label: 'Great', value: 5 },
];

interface MoodCheckInProps {
  onCheckIn: () => void;
  initialMood?: number | null;
}

export function MoodCheckIn({ onCheckIn, initialMood = null }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(initialMood);
  const [isLoading, setIsLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    checkTodaysMood();
  }, []);

  const checkTodaysMood = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('mood_checkins')
      .select('mood')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .single<{ mood: number }>();

    if (data) {
      setTodayMood(data.mood);
    }
  };

  const handleMoodSelect = async (mood: number) => {
  if (todayMood !== null) return; // Don't allow changing mood once set for the day
  
  setSelectedMood(mood);
  setIsLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('mood_checkins')
      .insert({
        user_id: user.id, 
        mood,
        notes: ''
      } as never); // Type assertion to fix the type error

    if (error) throw error;
    
    setTodayMood(mood);
    onCheckIn();
  } catch (error) {
    console.error('Error saving mood:', error);
  } finally {
    setIsLoading(false);
  }
};

  if (todayMood !== null) {
    const mood = MOOD_EMOJIS.find(m => m.value === todayMood) || MOOD_EMOJIS[2];
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <span className="text-blue-600">Today's Mood</span>
            <span className="text-2xl">{mood.icon}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-600 mb-4">You're feeling <span className="font-medium">{mood.label.toLowerCase()}</span> today</p>
          <p className="text-sm text-slate-500 text-center">Check back tomorrow to log your mood again!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          {MOOD_EMOJIS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.value)}
              disabled={isLoading}
              className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                selectedMood === mood.value 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
              type="button"
            >
              <span className="text-2xl mb-1">{mood.icon}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
