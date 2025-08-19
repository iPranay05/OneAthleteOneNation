import React, { createContext, useContext, useMemo, useState } from 'react';

const ActivitiesContext = createContext({
  activities: [],
  addActivity: (_activity) => {},
});

export function ActivitiesProvider({ children }) {
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      user: 'Priya Kabaddi',
      sport: 'Kabaddi',
      avatar: require('../../assets/icon.png'),
      title: 'Evening Practice',
      description: 'Worked on raids, tackles, and quick transitions.',
      when: 'Today 6:00 PM',
      location: 'City Ground',
      ts: Date.now() - 1000 * 60 * 45,
    },
    {
      id: 'act-2',
      user: 'Rahul Badminton',
      sport: 'Badminton',
      avatar: require('../../assets/icon.png'),
      title: 'Footwork & Drills',
      description: 'Split-step, shadow movement, and net control drills.',
      when: 'Tomorrow 7:00 AM',
      location: 'Sunrise Sports Club',
      ts: Date.now() - 1000 * 60 * 120,
    },
    {
      id: 'act-3',
      user: 'Alex Runner',
      sport: 'Track & Field',
      avatar: require('../../assets/icon.png'),
      title: 'Tempo Run',
      description: '20-min tempo @ comfortably hard pace. Felt solid.',
      when: 'Yesterday 5:30 PM',
      location: 'National Stadium',
      ts: Date.now() - 1000 * 60 * 60 * 18,
    },
  ]);

  const addActivity = (activity) => {
    const prepared = { ...activity };
    if (!prepared.id) prepared.id = String(Date.now());
    if (!prepared.ts) prepared.ts = Date.now();
    setActivities((prev) => [prepared, ...prev]);
  };

  const value = useMemo(() => ({ activities, addActivity }), [activities]);
  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
}

export function useActivities() {
  return useContext(ActivitiesContext);
}
