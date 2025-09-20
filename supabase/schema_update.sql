-- Updated schema that handles existing tables
-- Run this instead of the main schema.sql if you get "relation already exists" errors

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE disability_type AS ENUM ('visual', 'hearing', 'physical', 'intellectual', 'none');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sport_type AS ENUM ('running', 'swimming', 'cycling', 'basketball', 'football', 'tennis', 'badminton', 'cricket', 'hockey', 'volleyball', 'athletics', 'powerlifting', 'wrestling', 'boxing', 'judo', 'archery', 'shooting', 'table_tennis', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'athlete',
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    
    -- Athlete specific fields
    disability_type disability_type DEFAULT 'none',
    disability_description TEXT,
    primary_sport sport_type,
    secondary_sports sport_type[],
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    
    -- Location
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    
    -- Profile completion and verification
    profile_completed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing certificates table to match new schema
-- First, check if we need to add new columns
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='user_id') THEN
        ALTER TABLE public.certificates ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='issue_date') THEN
        ALTER TABLE public.certificates ADD COLUMN issue_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='expiry_date') THEN
        ALTER TABLE public.certificates ADD COLUMN expiry_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='certificate_url') THEN
        ALTER TABLE public.certificates ADD COLUMN certificate_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certificates' AND column_name='is_verified') THEN
        ALTER TABLE public.certificates ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sport sport_type,
    exercises JSONB,
    duration_minutes INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table (for social features)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    sport sport_type,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (for tracking user activities)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sport sport_type,
    duration_minutes INTEGER,
    distance_km DECIMAL(8,2),
    calories_burned INTEGER,
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table (training plans)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sport sport_type,
    plan_data JSONB,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id), -- Could be a coach
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaches table (for coach-specific data)
CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specializations sport_type[],
    experience_years INTEGER,
    certifications TEXT[],
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    availability JSONB, -- Store availability schedule
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can delete own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can only access their own certificates" ON public.certificates;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates" ON public.certificates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates" ON public.certificates
    FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON public.activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.activities
    FOR DELETE USING (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Users can view own plans" ON public.plans
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can insert own plans" ON public.plans
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update own plans" ON public.plans
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Coaches policies
CREATE POLICY "Coach profiles are viewable by everyone" ON public.coaches
    FOR SELECT USING (true);

CREATE POLICY "Coaches can insert their own profile" ON public.coaches
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Coaches can update own profile" ON public.coaches
    FOR UPDATE USING (auth.uid() = id);

-- Create or replace functions and triggers

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers and recreate them
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON public.certificates;
DROP TRIGGER IF EXISTS handle_updated_at ON public.workouts;
DROP TRIGGER IF EXISTS handle_updated_at ON public.posts;
DROP TRIGGER IF EXISTS handle_updated_at ON public.plans;
DROP TRIGGER IF EXISTS handle_updated_at ON public.coaches;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.coaches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_sport ON public.profiles(primary_sport);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_sport ON public.workouts(sport);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON public.plans(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_specializations ON public.coaches USING GIN(specializations);

-- Success message
SELECT 'Schema update completed successfully! All tables and policies are now set up.' as result;
