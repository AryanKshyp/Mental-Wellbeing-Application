type StoredHabit = {
  id: string;
  name: string;
  completed: boolean;
  time?: string;
  created_at: string;
  updated_at: string;
};

type StoredMood = {
  id: string;
  mood: number;
  created_at: string;
};

export const storage = {
  // Habits
  getHabits: (): StoredHabit[] => {
    if (typeof window === 'undefined') return [];
    const habits = localStorage.getItem('habits');
    return habits ? JSON.parse(habits) : [];
  },
  
  saveHabits: (habits: StoredHabit[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  },
  
  // Mood Check-ins
  getMoodCheckIns: (): StoredMood[] => {
    if (typeof window === 'undefined') return [];
    const checkins = localStorage.getItem('moodCheckIns');
    return checkins ? JSON.parse(checkins) : [];
  },
  
  saveMoodCheckIn: (mood: number) => {
    if (typeof window !== 'undefined') {
      const checkins = storage.getMoodCheckIns();
      const newCheckin = {
        id: crypto.randomUUID(),
        mood,
        created_at: new Date().toISOString()
      };
      const updatedCheckins = [...checkins, newCheckin];
      localStorage.setItem('moodCheckIns', JSON.stringify(updatedCheckins));
      return newCheckin;
    }
    return null;
  },
  
  // User Stats
  getUserStats: () => {
    if (typeof window === 'undefined') return { current_streak: 0 };
    const stats = localStorage.getItem('userStats');
    return stats ? JSON.parse(stats) : { current_streak: 0 };
  },
  
  updateUserStats: (updates: { current_streak?: number }) => {
    if (typeof window !== 'undefined') {
      const currentStats = storage.getUserStats();
      const updatedStats = { ...currentStats, ...updates };
      localStorage.setItem('userStats', JSON.stringify(updatedStats));
      return updatedStats;
    }
    return null;
  }
};
