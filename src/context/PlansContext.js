import React, { createContext, useContext, useMemo, useState } from 'react';

const PlansContext = createContext({
  coachSchedules: [],
  myPlans: [],
  addUserPlan: (_plan) => {},
  replaceCoachSchedules: (_schedules) => {},
});

export function PlansProvider({ children }) {
  // Seed: example coach schedule with simple week view
  const [coachSchedules, setCoachSchedules] = useState([
    {
      id: 'coach-1',
      title: '4-week Pre-Season Sprint Block',
      status: 'Assigned',
      detail: 'Focus: acceleration + mobility',
      schedule: [
        { day: 'Mon', items: ['Acceleration drills', '3x200m @ 80%', 'Mobility 15m'] },
        { day: 'Tue', items: ['Strength (Lower)', 'Core 10m'] },
        { day: 'Wed', items: ['Tempo run 5km', 'Stretch 15m'] },
        { day: 'Thu', items: ['Plyometrics', '4x150m @ 85%'] },
        { day: 'Fri', items: ['Strength (Upper)', 'Mobility 15m'] },
        { day: 'Sat', items: ['Easy run 3km', 'Foam roll'] },
        { day: 'Sun', items: ['Rest'] },
      ],
    },
  ]);

  const [myPlans, setMyPlans] = useState([]);

  const addUserPlan = (plan) => {
    const p = { id: String(Date.now()), status: 'Planned', schedule: [], ...plan };
    setMyPlans((prev) => [p, ...prev]);
  };

  const replaceCoachSchedules = (schedules) => setCoachSchedules(schedules);

  const value = useMemo(
    () => ({ coachSchedules, myPlans, addUserPlan, replaceCoachSchedules }),
    [coachSchedules, myPlans]
  );

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans() {
  return useContext(PlansContext);
}
