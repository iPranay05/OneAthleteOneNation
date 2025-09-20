-- Create coach_assignments table for OneNationOneAthlete app
-- Run this in your Supabase SQL Editor

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
CREATE INDEX IF NOT EXISTS idx_coach_assignments_type ON coach_assignments(assignment_type);

-- Enable Row Level Security
ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own coach assignments" ON coach_assignments;
DROP POLICY IF EXISTS "Coaches can manage their assignments" ON coach_assignments;
DROP POLICY IF EXISTS "Athletes can view their assignments" ON coach_assignments;

-- Create RLS policies
CREATE POLICY "Athletes can view their assignments" ON coach_assignments
  FOR SELECT USING (
    auth.uid() = athlete_id
  );

CREATE POLICY "Coaches can view their assignments" ON coach_assignments
  FOR SELECT USING (
    auth.uid() = coach_id
  );

CREATE POLICY "Coaches can manage assignments" ON coach_assignments
  FOR ALL USING (
    auth.uid() = coach_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('coach', 'admin')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_coach_assignments_updated_at ON coach_assignments;
CREATE TRIGGER update_coach_assignments_updated_at
    BEFORE UPDATE ON coach_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (replace UUIDs with actual user IDs from your auth.users table)
-- First, let's see what users we have:
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE raw_user_meta_data->>'role' = 'coach';
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE raw_user_meta_data->>'role' = 'athlete';

-- Example insert (you'll need to replace these UUIDs with real ones):
-- INSERT INTO coach_assignments (athlete_id, coach_id, assignment_type, priority) VALUES
--   ('athlete-uuid-here', 'coach-uuid-here', 'primary', 1),
--   ('athlete-uuid-here', 'backup-coach-uuid-here', 'secondary', 1);

-- Query to check the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'coach_assignments' 
ORDER BY ordinal_position;

-- Query to check existing assignments
SELECT 
  ca.*,
  athlete.email as athlete_email,
  coach.email as coach_email
FROM coach_assignments ca
LEFT JOIN auth.users athlete ON athlete.id = ca.athlete_id
LEFT JOIN auth.users coach ON coach.id = ca.coach_id
ORDER BY ca.created_at DESC;
