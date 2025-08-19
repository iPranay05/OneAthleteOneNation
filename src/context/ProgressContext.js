import React, { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const [dailySteps, setDailySteps] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [achievements, setAchievements] = useState([
    { id: '1', name: '5K Steps', icon: 'trophy', unlocked: true, date: new Date().toISOString() },
    { id: '2', name: '7 Day Streak', icon: 'flame', unlocked: true, date: new Date().toISOString() },
    { id: '3', name: 'Personal Best', icon: 'star', unlocked: true, date: new Date().toISOString() },
    { id: '4', name: '10K Steps', icon: 'lock-closed', unlocked: false, date: null },
    { id: '5', name: 'Marathon Month', icon: 'lock-closed', unlocked: false, date: null },
    { id: '6', name: 'Consistency King', icon: 'lock-closed', unlocked: false, date: null },
  ]);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [personalBests, setPersonalBests] = useState({
    dailySteps: 8500,
    weeklySteps: 45000,
    longestStreak: 14,
    totalWorkouts: 25,
  });

  // Initialize with mock data for the last 7 days
  useEffect(() => {
    const initializeWeeklyData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const steps = Math.floor(Math.random() * 5000) + 3000; // 3000-8000 steps
        
        data.push({
          date: new Date(date),
          steps: steps,
          calories: Math.round(steps * 0.04),
          distance: (steps * 0.78) / 1000, // km
          activeMinutes: Math.round(steps / 100),
        });
      }
      
      setWeeklyData(data);
    };

    if (weeklyData.length === 0) {
      initializeWeeklyData();
    }
  }, []);

  const getTodaySteps = () => {
    const today = new Date().toDateString();
    return dailySteps[today] || (weeklyData[weeklyData.length - 1]?.steps || 0);
  };

  const updateTodaySteps = (steps) => {
    const today = new Date().toDateString();
    setDailySteps(prev => ({
      ...prev,
      [today]: steps
    }));

    // Update weekly data for today
    setWeeklyData(prev => {
      const updated = [...prev];
      const todayIndex = updated.findIndex(d => d.date.toDateString() === today);
      
      if (todayIndex >= 0) {
        updated[todayIndex] = {
          ...updated[todayIndex],
          steps: steps,
          calories: Math.round(steps * 0.04),
          distance: (steps * 0.78) / 1000,
          activeMinutes: Math.round(steps / 100),
        };
      }
      
      return updated;
    });

    // Check for achievements
    checkAchievements(steps);
  };

  const checkAchievements = (steps) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      
      switch (achievement.name) {
        case '10K Steps':
          shouldUnlock = steps >= 10000;
          break;
        case 'Marathon Month':
          // Check if user has walked equivalent of marathon distance this month
          const monthlyDistance = weeklyData.reduce((sum, day) => sum + day.distance, 0) * 4; // Rough monthly estimate
          shouldUnlock = monthlyDistance >= 42.2; // Marathon distance
          break;
        case 'Consistency King':
          shouldUnlock = currentStreak >= 30;
          break;
      }

      if (shouldUnlock) {
        return {
          ...achievement,
          unlocked: true,
          date: new Date().toISOString()
        };
      }

      return achievement;
    }));
  };

  const addWorkoutCompletion = (workoutData) => {
    const { steps = 0, duration = 0, calories = 0 } = workoutData;
    
    // Add workout steps to today's total
    const currentSteps = getTodaySteps();
    updateTodaySteps(currentSteps + steps);
    
    // Update personal bests
    setPersonalBests(prev => ({
      ...prev,
      totalWorkouts: prev.totalWorkouts + 1,
      dailySteps: Math.max(prev.dailySteps, currentSteps + steps),
    }));
  };

  const getWeeklyStats = () => {
    const totalSteps = weeklyData.reduce((sum, day) => sum + day.steps, 0);
    const totalDistance = weeklyData.reduce((sum, day) => sum + day.distance, 0);
    const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
    const averageSteps = Math.round(totalSteps / weeklyData.length);
    
    return {
      totalSteps,
      totalDistance: totalDistance.toFixed(1),
      totalCalories: Math.round(totalCalories),
      averageSteps,
      daysActive: weeklyData.filter(day => day.steps > 1000).length,
    };
  };

  const getProgressToGoal = (goal = 8000) => {
    const todaySteps = getTodaySteps();
    return Math.min(100, Math.round((todaySteps / goal) * 100));
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => a.unlocked);
  };

  const getLockedAchievements = () => {
    return achievements.filter(a => !a.unlocked);
  };

  const refreshWeeklyData = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new random data
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const steps = Math.floor(Math.random() * 5000) + 3000;
      
      data.push({
        date: new Date(date),
        steps: steps,
        calories: Math.round(steps * 0.04),
        distance: (steps * 0.78) / 1000,
        activeMinutes: Math.round(steps / 100),
      });
    }
    
    setWeeklyData(data);
  };

  const value = {
    // Data
    weeklyData,
    achievements,
    currentStreak,
    personalBests,
    
    // Getters
    getTodaySteps,
    getWeeklyStats,
    getProgressToGoal,
    getUnlockedAchievements,
    getLockedAchievements,
    
    // Actions
    updateTodaySteps,
    addWorkoutCompletion,
    refreshWeeklyData,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
