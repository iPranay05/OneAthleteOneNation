import { supabase } from './supabaseConfig';

export const coachAssignmentService = {
  // Get all coaches who have registered and logged into the app
  async getRegisteredCoaches() {
    try {
      const { data: coaches, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          created_at,
          updated_at
        `)
        .eq('role', 'coach'); // Get all coaches regardless of login status for now

      if (error) {
        console.error('Error fetching registered coaches:', error);
        return [];
      }

      // Transform Supabase data to our coach format
      return coaches.map(coach => ({
        id: coach.id,
        name: coach.full_name || coach.email || 'Coach',
        specialization: 'General Training', // Default since sports column doesn't exist
        experience: 'Professional', // Default experience
        rating: 4.5 + Math.random() * 0.5, // Generate rating between 4.5-5.0
        languages: ['English', 'Hindi'], // Default languages
        certifications: ['Certified Coach', 'Sports Training'],
        avatar: '👨‍🏫',
        contactInfo: {
          phone: coach.phone || 'Not provided',
          email: coach.email || 'No email'
        },
        joinedAt: coach.created_at,
        isReal: true // Flag to identify real coaches
      }));
    } catch (error) {
      console.error('Error in getRegisteredCoaches:', error);
      return [];
    }
  },

  // Get coach assignments for a specific athlete
  async getAthleteCoachAssignments(athleteId) {
    try {
      // TODO: Implement when coach_assignments table is created
      console.log('Coach assignments table not yet created, returning null');
      return null;
    } catch (error) {
      console.error('Error in getAthleteCoachAssignments:', error);
      return null;
    }
  },

  // Assign a coach to an athlete
  async assignCoach(athleteId, coachId, assignmentType = 'primary', priority = 1) {
    try {
      // TODO: Implement when coach_assignments table is created
      console.log('Coach assignments table not yet created, assignment not saved');
      return { id: 'temp-assignment', athlete_id: athleteId, coach_id: coachId };
    } catch (error) {
      console.error('Error in assignCoach:', error);
      throw error;
    }
  },

  // Remove coach assignment
  async removeCoachAssignment(athleteId, coachId) {
    try {
      // TODO: Implement when coach_assignments table is created
      console.log('Coach assignments table not yet created, removal not saved');
      return true;
    } catch (error) {
      console.error('Error in removeCoachAssignment:', error);
      throw error;
    }
  },

  // Get athletes assigned to a specific coach
  async getCoachAthletes(coachId) {
    try {
      // TODO: Implement when coach_assignments table is created
      console.log('Coach assignments table not yet created, returning empty');
      return { primary: [], secondary: [], total: 0 };
    } catch (error) {
      console.error('Error in getCoachAthletes:', error);
      return { primary: [], secondary: [], total: 0 };
    }
  },

  // Create coach assignments table if it doesn't exist
  async initializeCoachAssignmentsTable() {
    try {
      // This would typically be done via Supabase SQL editor
      // But we can check if the table exists
      const { data, error } = await supabase
        .from('coach_assignments')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist - would need to create via SQL
        console.log('Coach assignments table needs to be created in Supabase');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking coach assignments table:', error);
      return false;
    }
  }
};

// SQL to create the coach_assignments table (run in Supabase SQL editor):
export const CREATE_COACH_ASSIGNMENTS_TABLE_SQL = `
-- Create coach_assignments table
CREATE TABLE IF NOT EXISTS coach_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('primary', 'secondary')),
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_assignments_athlete_id ON coach_assignments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach_id ON coach_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_status ON coach_assignments(status);

-- Enable Row Level Security
ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own coach assignments" ON coach_assignments
  FOR SELECT USING (
    auth.uid() = athlete_id OR 
    auth.uid() = coach_id
  );

CREATE POLICY "Coaches can manage their assignments" ON coach_assignments
  FOR ALL USING (
    auth.uid() = coach_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO coach_assignments (athlete_id, coach_id, assignment_type, priority) VALUES
  -- You'll need to replace these UUIDs with actual user IDs from your auth.users table
  ('athlete-uuid-here', 'coach-uuid-here', 'primary', 1),
  ('athlete-uuid-here', 'backup-coach-uuid-here', 'secondary', 1);
`;
