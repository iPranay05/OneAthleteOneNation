-- Create video calls tables for real-time video calling
-- Run this in your Supabase SQL Editor

-- Create video_calls table
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  callee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  caller_name TEXT,
  callee_name TEXT,
  status TEXT DEFAULT 'calling' CHECK (status IN ('calling', 'accepted', 'rejected', 'ended', 'missed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call_signaling table for WebRTC signaling
CREATE TABLE IF NOT EXISTS call_signaling (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES video_calls(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  message_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_calls_caller_id ON video_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_callee_id ON video_calls(callee_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created_at ON video_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_signaling_call_id ON call_signaling(call_id);
CREATE INDEX IF NOT EXISTS idx_call_signaling_created_at ON call_signaling(created_at DESC);

-- Enable Row Level Security
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signaling ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own calls" ON video_calls;
DROP POLICY IF EXISTS "Users can create calls" ON video_calls;
DROP POLICY IF EXISTS "Users can update their calls" ON video_calls;
DROP POLICY IF EXISTS "Users can view call signaling" ON call_signaling;
DROP POLICY IF EXISTS "Users can create signaling messages" ON call_signaling;

-- Create RLS policies for video_calls
CREATE POLICY "Users can view their own calls" ON video_calls
  FOR SELECT USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

CREATE POLICY "Users can create calls" ON video_calls
  FOR INSERT WITH CHECK (
    auth.uid() = caller_id
  );

CREATE POLICY "Users can update their calls" ON video_calls
  FOR UPDATE USING (
    auth.uid() = caller_id OR auth.uid() = callee_id
  ) WITH CHECK (
    auth.uid() = caller_id OR auth.uid() = callee_id
  );

-- Create RLS policies for call_signaling
CREATE POLICY "Users can view call signaling" ON call_signaling
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_calls 
      WHERE video_calls.id = call_signaling.call_id 
      AND (video_calls.caller_id = auth.uid() OR video_calls.callee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create signaling messages" ON call_signaling
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_calls 
      WHERE video_calls.id = call_signaling.call_id 
      AND (video_calls.caller_id = auth.uid() OR video_calls.callee_id = auth.uid())
    )
  );

-- Function to calculate call duration
CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ended' AND NEW.accepted_at IS NOT NULL AND NEW.ended_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.accepted_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for call duration calculation
DROP TRIGGER IF EXISTS calculate_call_duration_trigger ON video_calls;
CREATE TRIGGER calculate_call_duration_trigger
    BEFORE UPDATE ON video_calls
    FOR EACH ROW
    EXECUTE FUNCTION calculate_call_duration();

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE video_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE call_signaling;

-- Sample query to check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'video_calls' 
ORDER BY ordinal_position;

-- Sample query to check existing calls
SELECT 
  vc.*,
  caller.email as caller_email,
  callee.email as callee_email
FROM video_calls vc
LEFT JOIN auth.users caller ON caller.id = vc.caller_id
LEFT JOIN auth.users callee ON callee.id = vc.callee_id
ORDER BY vc.created_at DESC
LIMIT 10;
