-- Check the structure of your profiles table
-- Run this in Supabase SQL Editor to see what columns exist

-- 1. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing profiles with role = 'coach'
SELECT 
  id,
  full_name,
  email,
  phone,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE role = 'coach'
LIMIT 10;

-- 3. Check all roles in the table
SELECT 
  role, 
  COUNT(*) as count 
FROM profiles 
GROUP BY role;

-- 4. Check if any users exist
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'coach' THEN 1 END) as coaches,
  COUNT(CASE WHEN role = 'athlete' THEN 1 END) as athletes
FROM profiles;
