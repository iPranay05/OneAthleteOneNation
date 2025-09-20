import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { coachAssignmentService } from '../services/coachAssignmentService';
import { useAuth } from './AuthContext';

const CoachAssignmentContext = createContext();

export const useCoachAssignment = () => {
  const context = useContext(CoachAssignmentContext);
  if (!context) {
    throw new Error('useCoachAssignment must be used within a CoachAssignmentProvider');
  }
  return context;
};

const COACH_ASSIGNMENTS_KEY = '@OneNationOneAthlete:coachAssignments';
const COACH_AVAILABILITY_KEY = '@OneNationOneAthlete:coachAvailability';
const COACH_PROFILES_KEY = '@OneNationOneAthlete:coachProfiles';

export const CoachAssignmentProvider = ({ children }) => {
  const [coachAssignments, setCoachAssignments] = useState({});
  const [coachAvailability, setCoachAvailability] = useState({});
  const [coachProfiles, setCoachProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  // Load data on initialization and when user changes
  useEffect(() => {
    loadCoachData();
  }, [user]);

  // Clear cached mock data
  const clearMockData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(COACH_ASSIGNMENTS_KEY),
        AsyncStorage.removeItem(COACH_AVAILABILITY_KEY),
        AsyncStorage.removeItem(COACH_PROFILES_KEY)
      ]);
      console.log('Cleared cached mock data');
      // Reload data from Supabase
      await loadCoachData();
    } catch (error) {
      console.error('Error clearing mock data:', error);
    }
  };

  // Load real coaches from Supabase
  const loadRegisteredCoaches = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading coaches from Supabase...');
      
      const registeredCoaches = await coachAssignmentService.getRegisteredCoaches();
      console.log('📊 Raw coaches from Supabase:', registeredCoaches);
      
      // Convert array to object with coach IDs as keys
      const coachesById = {};
      const availabilityById = {};
      
      registeredCoaches.forEach(coach => {
        console.log('➕ Adding coach:', { id: coach.id, name: coach.name, email: coach.contactInfo?.email });
        coachesById[coach.id] = coach;
        
        // Create default availability for each coach
        availabilityById[coach.id] = {
          coachId: coach.id,
          status: 'available',
          schedule: {
            monday: { available: true, hours: '9:00-17:00' },
            tuesday: { available: true, hours: '9:00-17:00' },
            wednesday: { available: true, hours: '9:00-17:00' },
            thursday: { available: true, hours: '9:00-17:00' },
            friday: { available: true, hours: '9:00-17:00' },
            saturday: { available: true, hours: '10:00-14:00' },
            sunday: { available: false, hours: '' }
          },
          currentLoad: 0,
          maxCapacity: 15,
          lastActive: new Date().toISOString(),
          unavailableDates: []
        };
      });

      console.log('✅ Final coach profiles:', Object.keys(coachesById));
      setCoachProfiles(coachesById);
      setCoachAvailability(availabilityById);
      
      return { coaches: coachesById, availability: availabilityById };
    } catch (error) {
      console.error('❌ Error loading registered coaches:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadCoachData = async () => {
    try {
      // Always try to load real coaches from Supabase first
      const supabaseData = await loadRegisteredCoaches();
      
      if (supabaseData) {
        console.log('Loaded real coaches from Supabase:', Object.keys(supabaseData.coaches).length);
        
        // Even if no coaches, set empty data to show "no coaches registered"
        // Don't fallback to mock data when we have a successful Supabase connection
        
        // Load assignments from Supabase if user is logged in
        if (user) {
          await loadUserAssignments();
        }
      } else {
        console.log('Supabase connection failed, checking cached data');
        // Only use cached/mock data if Supabase completely fails
        const [assignments, availability, profiles] = await Promise.all([
          AsyncStorage.getItem(COACH_ASSIGNMENTS_KEY),
          AsyncStorage.getItem(COACH_AVAILABILITY_KEY),
          AsyncStorage.getItem(COACH_PROFILES_KEY)
        ]);

        if (profiles) {
          const cachedProfiles = JSON.parse(profiles);
          // Check if cached data is mock data (has mock IDs)
          const isMockData = Object.keys(cachedProfiles).some(id => id.startsWith('coach_'));
          
          if (isMockData) {
            console.log('Cached data is mock data, clearing it');
            // Clear mock data and show empty state
            setCoachProfiles({});
            setCoachAvailability({});
            setCoachAssignments({});
          } else {
            setCoachProfiles(cachedProfiles);
            setCoachAvailability(JSON.parse(availability) || {});
            setCoachAssignments(JSON.parse(assignments) || {});
          }
        } else {
          // No cached data and Supabase failed - show empty state
          setCoachProfiles({});
          setCoachAvailability({});
          setCoachAssignments({});
        }
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
      // On error, show empty state instead of mock data
      setCoachProfiles({});
      setCoachAvailability({});
      setCoachAssignments({});
    }
  };

  // Load user-specific assignments from Supabase
  const loadUserAssignments = async () => {
    if (!user) return;

    try {
      if (profile?.role === 'athlete') {
        // Load coach assignments for this athlete
        const assignments = await coachAssignmentService.getAthleteCoachAssignments(user.id);
        if (assignments) {
          setCoachAssignments({ [user.id]: assignments });
        }
      } else if (profile?.role === 'coach') {
        // Load athletes assigned to this coach
        const athletes = await coachAssignmentService.getCoachAthletes(user.id);
        // Update coach workload based on actual assignments
        setCoachAvailability(prev => ({
          ...prev,
          [user.id]: {
            ...prev[user.id],
            currentLoad: athletes.primary.length
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user assignments:', error);
    }
  };

  const initializeMockData = () => {
    const mockCoaches = {
      'coach_shubham': {
        id: 'coach_shubham',
        name: 'Shubham',
        specialization: 'Track & Field',
        experience: '10 years',
        rating: 4.9,
        languages: ['English', 'Hindi'],
        certifications: ['Level 4 Athletics Coach', 'Sports Performance'],
        avatar: '👨‍🏫',
        contactInfo: {
          phone: '+91 98765 11111',
          email: 'shubham@coach.com'
        }
      },
      'coach_abhin': {
        id: 'coach_abhin',
        name: 'Abhin',
        specialization: 'Swimming',
        experience: '8 years',
        rating: 4.8,
        languages: ['English', 'Malayalam'],
        certifications: ['Swimming Coach Level 3', 'Aquatic Safety'],
        avatar: '👨‍💼',
        contactInfo: {
          phone: '+91 98765 22222',
          email: 'abhin@coach.com'
        }
      },
      'coach_pranay': {
        id: 'coach_pranay',
        name: 'Pranay',
        specialization: 'Basketball',
        experience: '12 years',
        rating: 4.9,
        languages: ['English', 'Hindi', 'Marathi'],
        certifications: ['Basketball Coach', 'Youth Development'],
        avatar: '👨‍🎓',
        contactInfo: {
          phone: '+91 98765 33333',
          email: 'pranay@coach.com'
        }
      },
      'coach_yash': {
        id: 'coach_yash',
        name: 'Yash',
        specialization: 'Fitness Training',
        experience: '6 years',
        rating: 4.7,
        languages: ['English', 'Hindi'],
        certifications: ['Fitness Trainer', 'Strength & Conditioning'],
        avatar: '👨‍⚕️',
        contactInfo: {
          phone: '+91 98765 44444',
          email: 'yash@coach.com'
        }
      }
    };

    const mockAssignments = {
      'athlete_ritika': {
        athleteId: 'athlete_ritika',
        athleteName: 'Ritika',
        primaryCoach: {
          coachId: 'coach_shubham',
          assignedAt: new Date().toISOString(),
          status: 'active'
        },
        secondaryCoaches: [
          {
            coachId: 'coach_yash',
            assignedAt: new Date().toISOString(),
            status: 'backup',
            priority: 1
          }
        ],
        assignmentHistory: [
          {
            action: 'primary_assigned',
            coachId: 'coach_shubham',
            timestamp: new Date().toISOString(),
            reason: 'Initial assignment'
          },
          {
            action: 'secondary_added',
            coachId: 'coach_yash',
            timestamp: new Date().toISOString(),
            priority: 1,
            reason: 'Backup coach assignment'
          }
        ]
      }
    };

    const mockAvailability = {
      'coach_shubham': {
        coachId: 'coach_shubham',
        status: 'available',
        schedule: {
          monday: { available: true, hours: '9:00-17:00' },
          tuesday: { available: true, hours: '9:00-17:00' },
          wednesday: { available: true, hours: '9:00-17:00' },
          thursday: { available: true, hours: '9:00-17:00' },
          friday: { available: true, hours: '9:00-17:00' },
          saturday: { available: true, hours: '10:00-14:00' },
          sunday: { available: false, hours: '' }
        },
        currentLoad: 1,
        maxCapacity: 15,
        lastActive: new Date().toISOString(),
        unavailableDates: []
      },
      'coach_abhin': {
        coachId: 'coach_abhin',
        status: 'available',
        schedule: {
          monday: { available: true, hours: '8:00-16:00' },
          tuesday: { available: true, hours: '8:00-16:00' },
          wednesday: { available: true, hours: '8:00-16:00' },
          thursday: { available: true, hours: '8:00-16:00' },
          friday: { available: true, hours: '8:00-16:00' },
          saturday: { available: true, hours: '9:00-13:00' },
          sunday: { available: false, hours: '' }
        },
        currentLoad: 0,
        maxCapacity: 12,
        lastActive: new Date().toISOString(),
        unavailableDates: []
      },
      'coach_pranay': {
        coachId: 'coach_pranay',
        status: 'available',
        schedule: {
          monday: { available: true, hours: '10:00-18:00' },
          tuesday: { available: true, hours: '10:00-18:00' },
          wednesday: { available: true, hours: '10:00-18:00' },
          thursday: { available: true, hours: '10:00-18:00' },
          friday: { available: true, hours: '10:00-18:00' },
          saturday: { available: true, hours: '10:00-14:00' },
          sunday: { available: false, hours: '' }
        },
        currentLoad: 0,
        maxCapacity: 10,
        lastActive: new Date().toISOString(),
        unavailableDates: []
      },
      'coach_yash': {
        coachId: 'coach_yash',
        status: 'available',
        schedule: {
          monday: { available: true, hours: '7:00-15:00' },
          tuesday: { available: true, hours: '7:00-15:00' },
          wednesday: { available: true, hours: '7:00-15:00' },
          thursday: { available: true, hours: '7:00-15:00' },
          friday: { available: true, hours: '7:00-15:00' },
          saturday: { available: true, hours: '8:00-12:00' },
          sunday: { available: false, hours: '' }
        },
        currentLoad: 0,
        maxCapacity: 8,
        lastActive: new Date().toISOString(),
        unavailableDates: []
      }
    };

    setCoachProfiles(mockCoaches);
    setCoachAssignments(mockAssignments);
    setCoachAvailability(mockAvailability);
    
    saveCoachData(mockAssignments, mockAvailability, mockCoaches);
  };

  const saveCoachData = async (assignments, availability, profiles) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(COACH_ASSIGNMENTS_KEY, JSON.stringify(assignments || coachAssignments)),
        AsyncStorage.setItem(COACH_AVAILABILITY_KEY, JSON.stringify(availability || coachAvailability)),
        AsyncStorage.setItem(COACH_PROFILES_KEY, JSON.stringify(profiles || coachProfiles))
      ]);
    } catch (error) {
      console.error('Error saving coach data:', error);
    }
  };

  // Assign primary coach to athlete
  const assignPrimaryCoach = async (athleteId, athleteName, coachId) => {
    const assignment = {
      athleteId,
      athleteName,
      primaryCoach: {
        coachId,
        assignedAt: new Date().toISOString(),
        status: 'active'
      },
      secondaryCoaches: coachAssignments[athleteId]?.secondaryCoaches || [],
      assignmentHistory: [
        ...(coachAssignments[athleteId]?.assignmentHistory || []),
        {
          action: 'primary_assigned',
          coachId,
          timestamp: new Date().toISOString(),
          reason: 'Manual assignment'
        }
      ]
    };

    const updatedAssignments = {
      ...coachAssignments,
      [athleteId]: assignment
    };

    setCoachAssignments(updatedAssignments);
    await saveCoachData(updatedAssignments, null, null);
    
    return assignment;
  };

  // Add secondary coach to athlete
  const addSecondaryCoach = async (athleteId, coachId, priority = 1) => {
    const currentAssignment = coachAssignments[athleteId];
    if (!currentAssignment) return null;

    const secondaryCoach = {
      coachId,
      assignedAt: new Date().toISOString(),
      status: 'backup',
      priority
    };

    const updatedSecondaryCoaches = [
      ...currentAssignment.secondaryCoaches.filter(sc => sc.coachId !== coachId),
      secondaryCoach
    ].sort((a, b) => a.priority - b.priority);

    const updatedAssignment = {
      ...currentAssignment,
      secondaryCoaches: updatedSecondaryCoaches,
      assignmentHistory: [
        ...currentAssignment.assignmentHistory,
        {
          action: 'secondary_added',
          coachId,
          timestamp: new Date().toISOString(),
          priority,
          reason: 'Backup coach assignment'
        }
      ]
    };

    const updatedAssignments = {
      ...coachAssignments,
      [athleteId]: updatedAssignment
    };

    setCoachAssignments(updatedAssignments);
    await saveCoachData(updatedAssignments, null, null);
    
    return updatedAssignment;
  };

  // Remove coach from athlete
  const removeCoach = async (athleteId, coachId, isSecondary = false) => {
    const currentAssignment = coachAssignments[athleteId];
    if (!currentAssignment) return null;

    let updatedAssignment;

    if (isSecondary) {
      updatedAssignment = {
        ...currentAssignment,
        secondaryCoaches: currentAssignment.secondaryCoaches.filter(sc => sc.coachId !== coachId),
        assignmentHistory: [
          ...currentAssignment.assignmentHistory,
          {
            action: 'secondary_removed',
            coachId,
            timestamp: new Date().toISOString(),
            reason: 'Manual removal'
          }
        ]
      };
    } else {
      // Removing primary coach - promote first secondary if available
      const newPrimaryCoach = currentAssignment.secondaryCoaches[0];
      
      updatedAssignment = {
        ...currentAssignment,
        primaryCoach: newPrimaryCoach ? {
          coachId: newPrimaryCoach.coachId,
          assignedAt: new Date().toISOString(),
          status: 'active'
        } : null,
        secondaryCoaches: currentAssignment.secondaryCoaches.slice(1),
        assignmentHistory: [
          ...currentAssignment.assignmentHistory,
          {
            action: 'primary_removed',
            coachId,
            timestamp: new Date().toISOString(),
            reason: 'Manual removal'
          },
          ...(newPrimaryCoach ? [{
            action: 'primary_promoted',
            coachId: newPrimaryCoach.coachId,
            timestamp: new Date().toISOString(),
            reason: 'Automatic promotion from secondary'
          }] : [])
        ]
      };
    }

    const updatedAssignments = {
      ...coachAssignments,
      [athleteId]: updatedAssignment
    };

    setCoachAssignments(updatedAssignments);
    await saveCoachData(updatedAssignments, null, null);
    
    return updatedAssignment;
  };

  // Update coach availability
  const updateCoachAvailability = async (coachId, availabilityData) => {
    const updatedAvailability = {
      ...coachAvailability,
      [coachId]: {
        ...coachAvailability[coachId],
        ...availabilityData,
        lastUpdated: new Date().toISOString()
      }
    };

    setCoachAvailability(updatedAvailability);
    await saveCoachData(null, updatedAvailability, null);
    
    return updatedAvailability[coachId];
  };

  // Automatic failover when coach becomes unavailable
  const handleCoachFailover = async (coachId, reason = 'unavailable') => {
    const affectedAthletes = Object.values(coachAssignments).filter(
      assignment => assignment.primaryCoach?.coachId === coachId
    );

    const failoverResults = [];

    for (const assignment of affectedAthletes) {
      if (assignment.secondaryCoaches.length > 0) {
        // Promote first available secondary coach
        const newPrimaryCoach = assignment.secondaryCoaches[0];
        
        const updatedAssignment = {
          ...assignment,
          primaryCoach: {
            coachId: newPrimaryCoach.coachId,
            assignedAt: new Date().toISOString(),
            status: 'active'
          },
          secondaryCoaches: assignment.secondaryCoaches.slice(1),
          assignmentHistory: [
            ...assignment.assignmentHistory,
            {
              action: 'automatic_failover',
              fromCoachId: coachId,
              toCoachId: newPrimaryCoach.coachId,
              timestamp: new Date().toISOString(),
              reason: `Primary coach ${reason}`
            }
          ]
        };

        failoverResults.push({
          athleteId: assignment.athleteId,
          athleteName: assignment.athleteName,
          newPrimaryCoach: newPrimaryCoach.coachId,
          success: true
        });

        const updatedAssignments = {
          ...coachAssignments,
          [assignment.athleteId]: updatedAssignment
        };

        setCoachAssignments(updatedAssignments);
      } else {
        failoverResults.push({
          athleteId: assignment.athleteId,
          athleteName: assignment.athleteName,
          newPrimaryCoach: null,
          success: false,
          error: 'No secondary coaches available'
        });
      }
    }

    await saveCoachData(coachAssignments, null, null);
    return failoverResults;
  };

  // Get available coaches for assignment
  const getAvailableCoaches = (excludeCoachIds = []) => {
    const availableCoaches = Object.values(coachProfiles).filter(coach => {
      const availability = coachAvailability[coach.id];
      const isAvailable = !excludeCoachIds.includes(coach.id) && 
                         availability?.status === 'available' &&
                         availability?.currentLoad < availability?.maxCapacity;
      
      console.log(`Coach ${coach.name} (${coach.id}): available=${isAvailable}, status=${availability?.status}, load=${availability?.currentLoad}/${availability?.maxCapacity}`);
      return isAvailable;
    });
    
    console.log('Available coaches:', availableCoaches.map(c => ({ id: c.id, name: c.name })));
    return availableCoaches;
  };

  // Get athlete's coach assignment
  const getAthleteCoaches = (athleteId) => {
    return coachAssignments[athleteId] || null;
  };

  // Get coach's assigned athletes
  const getCoachAthletes = (coachId) => {
    const primaryAthletes = Object.values(coachAssignments).filter(
      assignment => assignment.primaryCoach?.coachId === coachId
    );
    
    const secondaryAthletes = Object.values(coachAssignments).filter(
      assignment => assignment.secondaryCoaches.some(sc => sc.coachId === coachId)
    );

    return {
      primary: primaryAthletes,
      secondary: secondaryAthletes,
      total: primaryAthletes.length + secondaryAthletes.length
    };
  };

  // Get coach workload statistics
  const getCoachWorkload = (coachId) => {
    const athletes = getCoachAthletes(coachId);
    const availability = coachAvailability[coachId];
    
    return {
      currentLoad: athletes.primary.length,
      maxCapacity: availability?.maxCapacity || 10,
      utilizationRate: availability?.maxCapacity ? 
        (athletes.primary.length / availability.maxCapacity * 100).toFixed(1) : 0,
      status: availability?.status || 'unknown',
      secondaryAssignments: athletes.secondary.length
    };
  };

  // Get system statistics
  const getSystemStats = () => {
    const totalAthletes = Object.keys(coachAssignments).length;
    const athletesWithPrimary = Object.values(coachAssignments).filter(
      a => a.primaryCoach
    ).length;
    const athletesWithSecondary = Object.values(coachAssignments).filter(
      a => a.secondaryCoaches.length > 0
    ).length;
    
    const totalCoaches = Object.keys(coachProfiles).length;
    const availableCoaches = Object.values(coachAvailability).filter(
      a => a.status === 'available'
    ).length;

    return {
      totalAthletes,
      athletesWithPrimary,
      athletesWithSecondary,
      athletesWithoutPrimary: totalAthletes - athletesWithPrimary,
      totalCoaches,
      availableCoaches,
      busyCoaches: totalCoaches - availableCoaches,
      coverageRate: totalAthletes > 0 ? (athletesWithPrimary / totalAthletes * 100).toFixed(1) : 0
    };
  };

  const value = {
    // State
    coachAssignments,
    coachAvailability,
    coachProfiles,
    loading,

    // Actions
    assignPrimaryCoach,
    addSecondaryCoach,
    removeCoach,
    updateCoachAvailability,
    handleCoachFailover,
    clearMockData,

    // Getters
    getAvailableCoaches,
    getAthleteCoaches,
    getCoachAthletes,
    getCoachWorkload,
    getSystemStats,
  };

  return (
    <CoachAssignmentContext.Provider value={value}>
      {children}
    </CoachAssignmentContext.Provider>
  );
};
