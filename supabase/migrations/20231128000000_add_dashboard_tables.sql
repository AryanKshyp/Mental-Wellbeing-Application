-- Create mood_checkins table
CREATE TABLE IF NOT EXISTS public.mood_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table to track streaks and other user statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns
-- We drop them first to avoid errors if re-running the script
DROP TRIGGER IF EXISTS update_mood_checkins_updated_at ON public.mood_checkins;
CREATE TRIGGER update_mood_checkins_updated_at
BEFORE UPDATE ON public.mood_checkins
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON public.habits;
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON public.habits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle user stats on login
CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS TRIGGER AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  days_since_last_login INTEGER;
  user_stats_record RECORD;
BEGIN
  -- Get user stats or create if not exists
  SELECT * INTO user_stats_record 
  FROM public.user_stats 
  WHERE user_id = NEW.id;
  
  IF NOT FOUND THEN
    -- Create new user stats record
    INSERT INTO public.user_stats (user_id, current_streak, longest_streak, last_login_date, total_checkins)
    VALUES (NEW.id, 1, 1, current_date, 1);
  ELSE
    -- Calculate days since last login
    -- Handle NULL last_login_date just in case
    IF user_stats_record.last_login_date IS NULL THEN
        days_since_last_login := 0; -- Treat as first login
    ELSE
        days_since_last_login := current_date - user_stats_record.last_login_date;
    END IF;
    
    -- Update streak logic
    IF days_since_last_login = 0 THEN
       -- Same day login, do nothing to streaks, just update updated_at (handled by other trigger)
       RETURN NEW;
    ELSIF days_since_last_login = 1 THEN
      -- Increment streak
      UPDATE public.user_stats
      SET 
        current_streak = user_stats_record.current_streak + 1,
        longest_streak = GREATEST(user_stats_record.longest_streak, user_stats_record.current_streak + 1),
        last_login_date = current_date,
        total_checkins = user_stats_record.total_checkins + 1
      WHERE user_id = NEW.id;
    ELSE
      -- Reset streak if missed a day
      UPDATE public.user_stats
      SET 
        current_streak = 1,
        last_login_date = current_date,
        total_checkins = user_stats_record.total_checkins + 1
      WHERE user_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FIXED TRIGGERS HERE ---------------------------
-- 1. Trigger for New Users (INSERT)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_user_login();

-- 2. Trigger for Returning Users (UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
EXECUTE FUNCTION handle_user_login();
--------------------------------------------------

-- Set up Row Level Security
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_checkins
DROP POLICY IF EXISTS "Users can view their own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users can view their own mood checkins" ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users can insert their own mood checkins" ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users can update their own mood checkins" ON public.mood_checkins FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users can delete their own mood checkins" ON public.mood_checkins FOR DELETE USING (auth.uid() = user_id);

-- Create policies for habits
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
CREATE POLICY "Users can insert their own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

-- Create a function to get mood trend
CREATE OR REPLACE FUNCTION get_mood_trend(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  today_mood INTEGER;
  yesterday_mood INTEGER;
BEGIN
  -- Get today's mood
  SELECT mood INTO today_mood
  FROM public.mood_checkins
  WHERE user_id = user_id_param
    AND created_at >= CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Get yesterday's mood
  SELECT mood INTO yesterday_mood
  FROM public.mood_checkins
  WHERE user_id = user_id_param
    AND created_at >= (CURRENT_DATE - INTERVAL '1 day')
    AND created_at < CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF today_mood IS NULL OR yesterday_mood IS NULL THEN
    RETURN 'Neutral';
  ELSIF today_mood > yesterday_mood THEN
    RETURN 'Improving';
  ELSIF today_mood < yesterday_mood THEN
    RETURN 'Declining';
  ELSE
    RETURN 'Neutral';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;