"use client";

import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HABIT_IDEAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, Timer, Plus, X, Clock, MessageSquare, Check, TrendingUp, Target, Bell, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MoodCheckIn } from "@/components/MoodCheckIn";

type Habit = {
  id: string;
  user_id: string;
  name: string;
  time: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type MoodCheckin = {
  id: string;
  user_id: string;
  mood: number;
  notes: string;
  created_at: string;
};

type UserStats = {
  current_streak: number;
  last_login: string;
};

const calculateMoodTrend = (todayMood: number, yesterdayMood: number | null) => {
  if (!yesterdayMood) return 'Neutral';
  if (todayMood > yesterdayMood) return 'Improving';
  if (todayMood < yesterdayMood) return 'Declining';
  return 'Neutral';
};

const calculateMoodPulse = (streak: number, habitsCompleted: number, totalHabits: number, moodScore: number) => {
  // Base score between 4-9
  let score = 4;
  
  // Add up to 2 points for streak (0.2 per day, max 10 days)
  score += Math.min(streak * 0.2, 2);
  
  // Add up to 2 points for habit completion (0.4 per 20% completion)
  const habitCompletion = totalHabits > 0 ? (habitsCompleted / totalHabits) * 100 : 0;
  score += (habitCompletion / 100) * 2;
  
  // Add up to 3 points for mood (0.6 per mood point above 1)
  score += (moodScore - 1) * 0.6;
  
  // Ensure score is between 4 and 9
  return Math.min(Math.max(score, 4), 9).toFixed(1);
};

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState({ name: "", time: "" });
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [moodScore, setMoodScore] = useState(5); // Default to neutral
  const [consistency, setConsistency] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  type MoodTrend = 'Improving' | 'Declining' | 'Neutral';
  const [moodTrend, setMoodTrend] = useState<MoodTrend>('Neutral');
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [yesterdayMood, setYesterdayMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  
  const completedHabits = habits.filter(habit => habit.completed).length;
  const totalHabits = habits.length;
  const moodPulse = calculateMoodPulse(currentStreak, completedHabits, totalHabits, todayMood || 3);
  
  const QUICK_STATS = [
    { label: "Current Streak", value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`, icon: Flame },
    { label: "Habits Completed", value: `${completedHabits}/${totalHabits}`, icon: Check },
    { 
      label: "Mood Trend", 
      value: moodTrend, 
      icon: moodTrend === 'Improving' ? ArrowUp : moodTrend === 'Declining' ? ArrowDown : Minus,
      className: moodTrend === 'Improving' ? 'text-green-500' : moodTrend === 'Declining' ? 'text-red-500' : 'text-amber-500'
    },
  ];
  
  const UPCOMING_EVENTS = [
    {
      id: 1,
      title: "Mentor Session with Sara",
      time: "Today, 6:00 PM",
      type: "call"
    },
    {
      id: 2,
      title: "Unread messages in Support Group",
      time: "2h ago",
      type: "chat"
    }
  ];
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Fetch user stats with proper typing
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single<Database['public']['Tables']['user_stats']['Row']>();
      
      if (stats) {
        setCurrentStreak(stats.current_streak);
      }
      
      // Fetch habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: Habit[] | null };
      
      if (habitsData) {
        setHabits(habitsData);
      }
      
      // Fetch today's mood
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMoodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .single<{ mood: number }>();
      
      if (todayMoodData) {
        setTodayMood(todayMoodData.mood);
        setMoodScore(todayMoodData.mood);
      }
      
      // Fetch yesterday's mood for trend
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const { data: yesterdayMoodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', `${yesterdayStr}T00:00:00`)
        .lte('created_at', `${yesterdayStr}T23:59:59`)
        .single<Database['public']['Tables']['mood_checkins']['Row']>();
      
      if (yesterdayMoodData) {
        setYesterdayMood(yesterdayMoodData.mood);
        const trend = calculateMoodTrend(todayMoodData?.mood || 3, yesterdayMoodData.mood) as MoodTrend;
        setMoodTrend(trend);
      }
      
      // Calculate consistency based on habit completion
      if (habitsData && habitsData.length > 0) {
        const completedCount = habitsData.filter(h => h.completed).length;
        setConsistency(Math.round((completedCount / habitsData.length) * 100));
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHabit = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const habitToUpdate = habits.find(h => h.id === id);
      if (!habitToUpdate) return;
      
      const updatedHabit = { ...habitToUpdate, completed: !habitToUpdate.completed };
      
      const { error } = await supabase
        .from('habits')
        .update({ 
          completed: updatedHabit.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setHabits(habits.map(habit => 
        habit.id === id ? updatedHabit : habit
      ));
      
      // Recalculate consistency
      const completedCount = habits.filter(h => h.id === id ? !h.completed : h.completed).length;
      setConsistency(Math.round((completedCount / habits.length) * 100));
      
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const addHabit = async () => {
    if (!newHabit.name.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
    const newHabitData = {
      user_id: user.id,
      name: newHabit.name.trim(),
      // CHANGED: Use a string default ("Anytime") to match your Habit type definition
      // If you really want null, you must update type Habit = { ... time: string | null ... }
      time: newHabit.time || "Anytime", 
      completed: false
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([newHabitData]) // Passing a single object is valid in supabase-js v2
      .select()
      .single();
      
      if (error) throw error;
      
      setHabits([...habits, data]);
      setNewHabit({ name: "", time: "" });
      setShowAddHabit(false);
      
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const removeHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setHabits(habits.filter(habit => habit.id !== id));
      
      // Recalculate consistency if there are habits left
      if (habits.length > 1) {
        const completedCount = habits.filter(h => h.id !== id && h.completed).length;
        setConsistency(Math.round((completedCount / (habits.length - 1)) * 100));
      } else {
        setConsistency(0);
      }
      
    } catch (error) {
      console.error('Error removing habit:', error);
    }
  };
  
  const handleMoodCheckIn = async () => {
    await fetchUserData(); // Refresh data after mood check-in
  };

  const getMoodStatus = (score: number) => {
    if (score >= 4.5) return "Excellent";
    if (score >= 3.5) return "Good";
    return "Needs Attention";
  };

  const getMoodColor = (score: number) => {
    if (score >= 4.5) return "from-green-400 to-teal-400";
    if (score >= 3.5) return "from-blue-400 to-cyan-400";
    return "from-orange-400 to-red-400";
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4 md:p-6 space-y-6">
      {/* Overview Section */}
      <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
          <CardHeader>
            <CardDescription className="text-blue-600">Hey there 👋</CardDescription>
            <CardTitle className="text-3xl text-slate-800">
              Welcome back to your wellness journey
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            {QUICK_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm border border-blue-100/30">
                  <div className={`p-2 rounded-lg ${stat.label === 'Mood Trend' ? stat.className?.includes('text-') ? 'bg-opacity-20' : 'bg-blue-50' : 'bg-blue-50'}`}>
                    <Icon className={`h-5 w-5 ${stat.label === 'Mood Trend' ? stat.className || 'text-blue-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">{stat.label}</p>
                    <p className={`font-semibold ${stat.label === 'Mood Trend' ? stat.className || 'text-slate-800' : 'text-slate-800'}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Up Next Section */}
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
          <CardHeader>
            <CardDescription className="text-blue-600">Up next</CardDescription>
            <CardTitle className="text-xl text-slate-800">Your schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {UPCOMING_EVENTS.length > 0 ? (
              <div className="space-y-3">
                {UPCOMING_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-blue-50">
                    <div className={`p-2 rounded-lg ${event.type === 'call' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                      {event.type === 'call' ? <Clock className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">{event.time}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600" type="button">
                      {event.type === 'call' ? 'Join' : 'View'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No upcoming events scheduled</p>
              </div>
            )}
            <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" type="button">
              Schedule New
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Mood Pulse Section */}
      <section>
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-blue-600">Mood Pulse</CardDescription>
                <CardTitle className="text-xl text-slate-800">
                  {getMoodStatus(parseFloat(moodPulse))} • {moodPulse} / 9
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-slate-500">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Bar */}
            <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getMoodColor(parseFloat(moodPulse))}`}
                    style={{ width: `${(parseFloat(moodPulse) / 9) * 100}%` }}
                ></div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Low Energy</span>
                <span>High Energy</span>
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/30">
                <p className="text-xs text-blue-700 mb-1">Streak</p>
                <p className="text-lg font-semibold text-slate-800">{currentStreak} days</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/30">
                <p className="text-xs text-blue-700 mb-1">Habits</p>
                <p className="text-lg font-semibold text-slate-800">{completedHabits}/{totalHabits}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/30">
                <p className="text-xs text-blue-700 mb-1">Mood</p>
                <p className="text-lg font-semibold text-slate-800">{todayMood || 'N/A'}/5</p>
                </div>
            </div>

            {/* Feedback Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100/30">
                <p className="text-sm text-slate-700 mb-2">
                {parseFloat(moodPulse) >= 7
                    ? "You're doing great! Your mood and habits are on point."
                    : parseFloat(moodPulse) >= 5
                    ? "You're making good progress. Keep it up!"
                    : "Let's work on improving your mood and habits."}
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                <Target className="h-3.5 w-3.5" />
                <span>
                    {parseFloat(moodPulse) >= 7 
                    ? "Keep up the great work!" 
                    : `Focus on completing ${Math.max(0, Math.ceil((5 - parseFloat(moodPulse)) * 2))} more habits today`}
                </span>
                </div>
            </div>

            <MoodCheckIn onCheckIn={handleMoodCheckIn} initialMood={todayMood} />
          </CardContent>
        </Card>
      </section>

      {/* Habit Tracker Section */}
      <section>
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-blue-600">Habit Tracker</CardDescription>
                <CardTitle className="text-xl text-slate-800">Daily Habits</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                onClick={() => setShowAddHabit(true)}
                type="button"
              >
                <Plus className="h-4 w-4" />
                <span>Add Habit</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showAddHabit && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Habit name"
                    className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  />
                  <input
                    type="time"
                    className="px-2 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={newHabit.time}
                    onChange={(e) => setNewHabit({ ...newHabit, time: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddHabit(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={addHabit}
                    type="button"
                  >
                    Add Habit
                  </Button>
                </div>
              </div>
            )}

            {habits.length > 0 ? (
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${habit.completed ? 'bg-green-50 border border-green-100' : 'bg-white border border-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`flex-shrink-0 h-5 w-5 rounded border ${habit.completed ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-slate-300'}`}
                        type="button"
                        aria-pressed={habit.completed}
                        aria-label={`Mark ${habit.name} as ${habit.completed ? 'incomplete' : 'complete'}`}
                      >
                        {habit.completed && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${habit.completed ? 'text-green-700 line-through' : 'text-slate-800'}`}>
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{habit.time}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors"
                      type="button"
                      aria-label={`Remove ${habit.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Plus className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-700">No habits yet</h3>
                <p className="mt-1 text-sm text-slate-500">Start by adding your first habit</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowAddHabit(true)}
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Habit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}