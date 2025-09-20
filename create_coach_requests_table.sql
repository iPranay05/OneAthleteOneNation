-- Create coach_requests table for real-time coach-athlete communication
-- Run this in your Supabase SQL Editor

-- Create coach_requests table
CREATE TABLE IF NOT EXISTS coach_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  coach_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_requests_athlete_id ON coach_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_coach_requests_coach_id ON coach_requests(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_requests_status ON coach_requests(status);
CREATE INDEX IF NOT EXISTS idx_coach_requests_created_at ON coach_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE coach_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Athletes can view their own requests" ON coach_requests;
DROP POLICY IF EXISTS "Coaches can view requests sent to them" ON coach_requests;
DROP POLICY IF EXISTS "Athletes can create requests" ON coach_requests;
DROP POLICY IF EXISTS "Coaches can update request status" ON coach_requests;

-- Create RLS policies
CREATE POLICY "Athletes can view their own requests" ON coach_requests
  FOR SELECT USING (
    auth.uid() = athlete_id
  );

CREATE POLICY "Coaches can view requests sent to them" ON coach_requests
  FOR SELECT USING (
    auth.uid() = coach_id
  );

CREATE POLICY "Athletes can create requests" ON coach_requests
  FOR INSERT WITH CHECK (
    auth.uid() = athlete_id
  );

CREATE POLICY "Coaches can update request status" ON coach_requests
  FOR UPDATE USING (
    auth.uid() = coach_id
  ) WITH CHECK (
    auth.uid() = coach_id
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coach_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.status != OLD.status THEN
        NEW.responded_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update timestamps
DROP TRIGGER IF EXISTS update_coach_requests_updated_at ON coach_requests;
CREATE TRIGGER update_coach_requests_updated_at
    BEFORE UPDATE ON coach_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_coach_requests_updated_at();

-- Insert sample data for testing (replace with real user IDs)
-- First, check what users exist:
-- SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users LIMIT 10;

-- Example inserts (replace UUIDs with real ones from your auth.users table):
-- INSERT INTO coach_requests (athlete_id, coach_id, message, status) VALUES
--   ('athlete-uuid-here', 'coach-uuid-here', 'Hi! I would like to request you as my coach. Looking forward to working with you!', 'pending');

-- Query to check the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'coach_requests' 
ORDER BY ordinal_position;

-- Query to check existing requests
SELECT 
  cr.*,
  athlete.email as athlete_email,
  coach.email as coach_email
FROM coach_requests cr
LEFT JOIN auth.users athlete ON athlete.id = cr.athlete_id
LEFT JOIN auth.users coach ON coach.id = cr.coach_id
ORDER BY cr.created_at DESC;
