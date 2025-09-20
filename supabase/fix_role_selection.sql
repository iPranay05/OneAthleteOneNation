-- Fix role selection by removing default role
-- Run this in Supabase SQL Editor

-- Remove the default role from the profiles table
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Update existing profiles that have the default 'athlete' role to NULL
-- This will force them to go through role selection
UPDATE public.profiles 
SET role = NULL 
WHERE role = 'athlete' AND profile_completed = FALSE;

-- Success message
SELECT 'Role selection fixed! Users will now see role selection screen.' as result;
