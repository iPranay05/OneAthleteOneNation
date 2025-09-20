-- Create posts table for storing user posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('coach', 'athlete')),
  author_avatar TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'link')),
  community TEXT NOT NULL DEFAULT 'General',
  sport TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  is_coach_post BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_community_idx ON posts(community);
CREATE INDEX IF NOT EXISTS posts_author_role_idx ON posts(author_role);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
-- Allow all authenticated users to read all posts (for cross-platform sharing)
CREATE POLICY "Allow authenticated users to read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own posts
CREATE POLICY "Allow users to insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample posts for testing (using dummy user IDs)
-- Note: Replace these UUIDs with actual user IDs from your auth.users table
DO $$
BEGIN
  -- Only insert if the table is empty to avoid duplicates
  IF NOT EXISTS (SELECT 1 FROM posts LIMIT 1) THEN
    INSERT INTO posts (
      user_id,
      author_name,
      author_role,
      author_avatar,
      content,
      media_url,
      media_type,
      community,
      sport,
      is_coach_post,
      created_at
    ) VALUES 
    (
      gen_random_uuid(),
      'Coach Sarah Williams',
      'coach',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      '🏃‍♀️ Training tip: Focus on your breathing technique during long runs. Proper breathing can improve your endurance by 15-20%. Remember: breathe in through your nose, out through your mouth!',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'image',
      'Track & Field',
      'athletics',
      true,
      NOW() - INTERVAL '30 minutes'
    ),
    (
      gen_random_uuid(),
      'Alex Runner',
      'athlete',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'Morning sprints felt great! New PR on 200m. 🔥',
      null,
      'none',
      'Track & Field',
      'athletics',
      false,
      NOW() - INTERVAL '1 hour'
    ),
    (
      gen_random_uuid(),
      'Coach Mike Johnson',
      'coach',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      '💪 Strength training is crucial for injury prevention. Here''s a quick tip: Always warm up for at least 10 minutes before lifting weights. Your muscles will thank you later!',
      null,
      'none',
      'Strength Training',
      'fitness',
      true,
      NOW() - INTERVAL '90 minutes'
    ),
    (
      gen_random_uuid(),
      'Rahul Sharma',
      'athlete',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'Just completed my morning 10K run! Feeling stronger every day. Thanks to my coach for the amazing training plan 💪',
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
      'image',
      'Running',
      'athletics',
      false,
      NOW() - INTERVAL '2 hours'
    );
  END IF;
END $$;
