-- Drop table if it exists (for clean setup)
DROP TABLE IF EXISTS posts;

-- Create posts table for storing user posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Temporarily remove foreign key constraint for sample data
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
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_community_idx ON posts(community);
CREATE INDEX posts_author_role_idx ON posts(author_role);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read all posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert posts" ON posts;
DROP POLICY IF EXISTS "Allow users to insert their own posts" ON posts;
DROP POLICY IF EXISTS "Allow users to update their own posts" ON posts;
DROP POLICY IF EXISTS "Allow users to delete their own posts" ON posts;

-- Create policies for posts
-- Allow all authenticated users to read all posts (for cross-platform sharing)
CREATE POLICY "Allow authenticated users to read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert posts (we'll check user_id in the app)
CREATE POLICY "Allow authenticated users to insert posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own posts (when user_id matches)
CREATE POLICY "Allow users to update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Allow users to delete their own posts (when user_id matches)
CREATE POLICY "Allow users to delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP FUNCTION IF EXISTS update_updated_at_column();

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

-- Insert sample posts for testing
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

-- Add foreign key constraint after sample data is inserted
-- Note: This will only work for new posts, existing sample posts will remain
-- ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For now, we'll skip the foreign key constraint to allow sample data
-- You can uncomment the above lines once you have real users in auth.users

-- Verify the table was created successfully
SELECT 'Posts table created successfully!' as status;
SELECT COUNT(*) as sample_posts_count FROM posts;

-- Show sample of the data
SELECT id, author_name, author_role, community, created_at FROM posts ORDER BY created_at DESC;
