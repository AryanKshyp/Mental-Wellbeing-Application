-- Create policies for user_stats
CREATE POLICY user_stats_select_own
ON public.user_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY user_stats_update_own
ON public.user_stats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY user_stats_insert_own
ON public.user_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for habits
CREATE POLICY habits_select_own
ON public.habits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY habits_insert_own
ON public.habits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY habits_update_own
ON public.habits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY habits_delete_own
ON public.habits
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for mood_checkins
CREATE POLICY mood_checkins_select_own
ON public.mood_checkins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY mood_checkins_insert_own
ON public.mood_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY mood_checkins_update_own
ON public.mood_checkins
FOR UPDATE
USING (auth.uid() = user_id);
