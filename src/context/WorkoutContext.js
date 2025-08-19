import React, { createContext, useContext, useState } from 'react';

const WorkoutContext = createContext();

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([
    {
      id: '1',
      title: 'Upper Body Strength',
      description: 'Focus on building upper body strength with adaptive exercises',
      duration: 45,
      difficulty: 'intermediate',
      source: 'coach',
      coachName: 'Coach Sarah',
      assignedDate: new Date().toISOString(),
      completed: false,
      completedDate: null,
      exercises: [
        {
          name: 'Seated Chest Press',
          duration: 12,
          sets: 3,
          reps: '10-12',
          description: 'Chest strengthening exercise adapted for wheelchair users',
          adaptations: ['Wheelchair accessible', 'Adjustable resistance']
        },
        {
          name: 'Lat Pulldowns',
          duration: 12,
          sets: 3,
          reps: '8-10',
          description: 'Back strengthening with proper form',
          adaptations: ['Seated position', 'Modified grip options']
        },
        {
          name: 'Shoulder Raises',
          duration: 10,
          sets: 2,
          reps: '12-15',
          description: 'Shoulder mobility and strength',
          adaptations: ['Light weights', 'Range of motion as comfortable']
        }
      ],
      tips: [
        'Focus on controlled movements',
        'Rest 60-90 seconds between sets',
        'Maintain proper posture throughout'
      ],
      safetyNotes: [
        'Stop if you feel any pain',
        'Have assistance available if needed',
        'Use proper equipment setup'
      ]
    },
    {
      id: '2',
      title: 'Cardio & Endurance',
      description: 'Cardiovascular training adapted for your fitness level',
      duration: 30,
      difficulty: 'beginner',
      source: 'coach',
      coachName: 'Coach Mike',
      assignedDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      completed: true,
      completedDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      exercises: [
        {
          name: 'Wheelchair Racing',
          duration: 15,
          sets: 1,
          reps: '15 minutes',
          description: 'Steady-state cardio training',
          adaptations: ['Racing wheelchair', 'Track or smooth surface']
        },
        {
          name: 'Arm Cycling',
          duration: 10,
          sets: 1,
          reps: '10 minutes',
          description: 'Upper body cardio workout',
          adaptations: ['Ergometer bike', 'Adjustable resistance']
        },
        {
          name: 'Cool Down Stretches',
          duration: 5,
          sets: 1,
          reps: '5 minutes',
          description: 'Gentle stretching and recovery',
          adaptations: []
        }
      ],
      tips: [
        'Monitor heart rate throughout',
        'Stay hydrated',
        'Gradual intensity increase'
      ],
      safetyNotes: [
        'Check equipment before use',
        'Have emergency contact available'
      ]
    }
  ]);

  const [workoutHistory, setWorkoutHistory] = useState([]);

  const addWorkout = (workout) => {
    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
      assignedDate: new Date().toISOString(),
      completed: false,
      completedDate: null,
      source: workout.source || 'ai'
    };
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  const completeWorkout = (workoutId, completionData = {}) => {
    setWorkouts(prev => prev.map(workout => {
      if (workout.id === workoutId) {
        const completedWorkout = {
          ...workout,
          completed: true,
          completedDate: new Date().toISOString(),
          ...completionData
        };
        
        // Add to history
        setWorkoutHistory(prevHistory => [completedWorkout, ...prevHistory]);
        
        return completedWorkout;
      }
      return workout;
    }));
  };

  const deleteWorkout = (workoutId) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
  };

  const getWorkoutsBySource = (source) => {
    return workouts.filter(workout => workout.source === source);
  };

  const getCompletedWorkouts = () => {
    return workouts.filter(workout => workout.completed);
  };

  const getPendingWorkouts = () => {
    return workouts.filter(workout => !workout.completed);
  };

  const getWorkoutStats = () => {
    const total = workouts.length;
    const completed = workouts.filter(w => w.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      pending,
      completionRate
    };
  };

  const value = {
    workouts,
    workoutHistory,
    addWorkout,
    completeWorkout,
    deleteWorkout,
    getWorkoutsBySource,
    getCompletedWorkouts,
    getPendingWorkouts,
    getWorkoutStats
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
