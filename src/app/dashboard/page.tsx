"use client";

import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HABIT_IDEAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, Timer, Plus, X, Clock, MessageSquare, Check, TrendingUp, Target, Bell, ArrowUp, ArrowDown, Minus, Heart, Smile, Frown, Meh, Laugh } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { format, subDays, isSameDay } from "date-fns";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

type Habit = Database['public']['Tables']['habits']['Row'];
type MoodCheckin = Database['public']['Tables']['mood_checkins']['Row'];
type UserStats = Database['public']['Tables']['user_stats']['Row'];

type MoodTrend = 'Improving' | 'Neutral' | 'Declining';

const calculateMoodTrend = (todayMood: number, yesterdayMood: number | null): MoodTrend => {
  if (!yesterdayMood || todayMood === yesterdayMood) return 'Neutral';
  return todayMood > yesterdayMood ? 'Improving' : 'Declining';
};

const calculateMoodPulse = (streak: number, habitsCompleted: number, totalHabits: number, moodScore: number): string => {
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

const getMoodIcon = (mood: number) => {
  switch (mood) {
    case 1: return <Frown className="h-5 w-5 text-red-500" />;
    case 2: return <Frown className="h-5 w-5 text-orange-500" />;
    case 3: return <Meh className="h-5 w-5 text-yellow-500" />;
    case 4: return <Smile className="h-5 w-5 text-blue-500" />;
    case 5: return <Laugh className="h-5 w-5 text-green-500" />;
    default: return <Meh className="h-5 w-5 text-gray-400" />;
}};

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState({ name: "", time: "" });
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [moodTrend, setMoodTrend] = useState<MoodTrend>('Neutral');
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [yesterdayMood, setYesterdayMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLogin, setLastLogin] = useState<string>('');

  const supabase = createClient();

  const toggleHabit = async (habitId: string) => {
    try {
      let newCompletedStatus: boolean | undefined;

      // 1. Optimistically update the UI
      setHabits(prevHabits => {
        return prevHabits.map(habit => {
          if (habit.id === habitId) {
            newCompletedStatus = !habit.completed; // Capture the new status
            return { ...habit, completed: newCompletedStatus };
          }
          return habit;
        });
      });

      // 2. Update in the database (Using the Nuclear Fix for types)
      // We check if newCompletedStatus is defined to ensure the habit was found
      if (newCompletedStatus !== undefined) {
        const { error } = await (supabase.from('habits') as any) // <--- Fix applied here
          .update({
            completed: newCompletedStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', habitId);

        // 3. Revert if there was an error
        if (error) {
          console.error('Error updating habit:', error);
          setHabits(prev => prev.map(h => 
            h.id === habitId ? { ...h, completed: !newCompletedStatus } : h
          ));
        }
      }

    } catch (error) {
      console.error('Error in toggleHabit:', error);
      // Optional: Revert here too if needed
    }
  };

  const completedHabits = habits.filter(habit => habit.completed).length;
  const totalHabits = habits.length;
  const moodPulse = calculateMoodPulse(currentStreak, completedHabits, totalHabits, todayMood || 3);

  const QUICK_STATS = [
    { 
      label: "Current Streak", 
      value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`, 
      icon: Flame,
      className: 'text-orange-500'
    },
    { 
      label: "Habits Completed", 
      value: `${completedHabits}/${totalHabits}`, 
      icon: Check,
      className: 'text-blue-500'
    },
    { 
      label: "Mood Trend", 
      value: moodTrend, 
      icon: moodTrend === 'Improving' ? ArrowUp : moodTrend === 'Declining' ? ArrowDown : Minus,
      className: moodTrend === 'Improving' 
        ? 'text-green-500' 
        : moodTrend === 'Declining' 
          ? 'text-red-500' 
          : 'text-amber-500'
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

      // Get the latest user stats (no need to call update_user_login)
      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single<UserStats>();

      if (stats) {
        setCurrentStreak(stats.current_streak);
        setLastLogin(stats.last_login ? new Date(stats.last_login).toLocaleDateString() : 'Never');
      }

      // Fetch habits with error handling
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) {
        console.error('Error fetching habits:', habitsError);
        return;
      }

      if (habitsData) {
        // Filter out any temporary habits that might be in the state
        setHabits(prevHabits => {
          const nonTempHabits = prevHabits.filter(h => !h.id.startsWith('temp-'));
          // Only update if there are actual changes
          if (JSON.stringify(nonTempHabits) !== JSON.stringify(habitsData)) {
            return habitsData;
          }
          return prevHabits;
        });
      }

      // Fetch today's mood
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      const { data: todayMoodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', `${todayStr}T00:00:00`)
        .lte('created_at', `${todayStr}T23:59:59`)
        .single<{ mood: number }>();

      if (todayMoodData) {
        setTodayMood(todayMoodData.mood);
      }

      // Fetch yesterday's mood for trend
      const yesterday = subDays(today, 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

      const { data: yesterdayMoodData } = await supabase
        .from('mood_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', `${yesterdayStr}T00:00:00`)
        .lte('created_at', `${yesterdayStr}T23:59:59`)
        .single<{ mood: number }>();

      if (yesterdayMoodData) {
        setYesterdayMood(yesterdayMoodData.mood);
      }

      // Calculate mood trend if we have both today's and yesterday's mood
      if (todayMoodData?.mood !== undefined) {
        const trend = calculateMoodTrend(
          todayMoodData.mood, 
          yesterdayMoodData?.mood || null
        );
        setMoodTrend(trend);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const habitName = newHabit.name.trim();
    if (!habitName) {
      console.error('Habit name is required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      
      // Create the new habit object for optimistic update
      const tempHabit: Habit = {
        id: tempId,
        user_id: user.id,
        name: habitName,
        time: newHabit.time || null,
        completed: false,
        created_at: now,
        updated_at: now
      };

      // Optimistically update the UI
      setHabits(prevHabits => [...prevHabits, tempHabit]);
      setNewHabit({ name: "", time: "" });
      setShowAddHabit(false);

      // Now make the actual API call
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitName,
          time: newHabit.time || null,
          completed: false,
          created_at: now,
          updated_at: now
        }as any)
        .select()
        .single();

      if (error) throw error;

      // Replace the temporary habit with the one from the server
      // Replace the problematic code with this:
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === tempId ? { ...data as Habit} : habit
      )
    );

    } catch (error) {
      console.error('Error adding habit:', error);
      // Revert the optimistic update in case of error
      setHabits(prevHabits => prevHabits.filter(h => h.id !== `temp-${Date.now()}`));
      // Show error to user (you might want to add a toast notification here)
    }
  };

  const removeHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));

    } catch (error) {
      console.error('Error removing habit:', error);
    }
  };

  const handleMoodCheckIn = async () => {
    await fetchUserData(); // Refresh data after mood check-in
  };

  const getMoodStatus = (score: number) => {
    const numScore = parseFloat(score.toString());
    if (numScore >= 7) return "Excellent";
    if (numScore >= 5) return "Good";
    return "Needs Attention";
  };

  const getMoodColor = (score: number) => {
    const numScore = parseFloat(score.toString());
    if (numScore >= 7) return "from-green-400 to-teal-400";
    if (numScore >= 5) return "from-blue-400 to-cyan-400";
    return "from-orange-400 to-red-400";
  };

  const getMoodPulseFeedback = (score: number) => {
    const numScore = parseFloat(score.toString());
    if (numScore >= 7) {
      return "Your mood and habits are looking great! Keep up the good work!";
    } else if (numScore >= 5) {
      return "You're doing well! A few more positive habits could boost your mood even more.";
    } else {
      return "Let's work on building some positive habits to improve your mood.";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center bg-white/80 p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading your dashboard...</p>
          <p className="text-sm text-slate-500 mt-1">We're getting everything ready for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <DashboardHeader />
      <div className="p-4 md:p-6 space-y-6">
        {/* Overview Section */}
        <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
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
                      <div className={`p-2 rounded-lg ${stat.className || 'bg-blue-50'}`}>
                        <Icon className={`h-5 w-5 ${stat.className || 'text-blue-500'}`} />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">{stat.label}</p>
                        <p className={`font-semibold ${stat.className || 'text-slate-800'}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mood Check-in Section */}
            <MoodCheckIn onCheckIn={handleMoodCheckIn} initialMood={todayMood || undefined} />
          </div>

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
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <p className="text-lg font-semibold text-slate-800">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/30">
                  <p className="text-xs text-blue-700 mb-1">Habits</p>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <p className="text-lg font-semibold text-slate-800">{completedHabits}/{totalHabits}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/30">
                  <p className="text-xs text-blue-700 mb-1">Mood</p>
                  <div className="flex items-center gap-2">
                    {todayMood ? getMoodIcon(todayMood) : <Meh className="h-4 w-4 text-gray-400" />}
                    <p className="text-lg font-semibold text-slate-800">{todayMood ? `${todayMood}/5` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100/30">
                <p className="text-sm text-slate-700 mb-2">
                  {getMoodPulseFeedback(parseFloat(moodPulse))}
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Target className="h-3.5 w-3.5" />
                  <span>
                    {parseFloat(moodPulse) >= 7 
                      ? "Keep up the great work!" 
                      : `Focus on completing ${Math.max(1, 3 - completedHabits)} more habits today`}
                  </span>
                </div>
              </div>

              {/* Mood Trend Indicator */}
              {moodTrend && todayMood && yesterdayMood && (
                <div className="p-3 rounded-xl bg-white/50 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Mood Trend</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      moodTrend === 'Improving' 
                        ? 'bg-green-100 text-green-800' 
                        : moodTrend === 'Declining' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {moodTrend}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="text-slate-500">Yesterday</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{yesterdayMood}/5</span>
                      {getMoodIcon(yesterdayMood)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <div className="text-slate-500">Today</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{todayMood}/5</span>
                      {getMoodIcon(todayMood)}
                    </div>
                  </div>
                </div>
              )}
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
                <form onSubmit={addHabit} className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Habit name"
                      className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                      required
                      minLength={2}
                      maxLength={100}
                      autoFocus
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
                      type="submit"
                      disabled={!newHabit.name.trim()}
                    >
                      Add Habit
                    </Button>
                  </div>
                </form>
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
                  <p className="mt-1 text-sm text-slate-500">Start by adding your first habit like: Mindful Breathing, Plan your Day, Journal, Reach out to a friend</p>
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
    </div>
  );
}