# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the OneNationOneAthlete React Native app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `OneNationOneAthlete`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Configure the following settings:

### Site URL
- Set to your app's URL scheme: `yourapp://`

### Auth Providers
- Enable **Email** provider (should be enabled by default)
- Configure email templates if needed

### Email Templates
You can customize the email templates for:
- Confirm signup
- Reset password
- Magic link
- Email change

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- User profiles table with athlete-specific fields
- Certificates table
- Workouts table
- Posts table for social features
- Activities tracking table
- Training plans table
- Coaches table
- Row Level Security (RLS) policies
- Necessary triggers and functions

## Step 4: Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:

### Avatars Bucket
- Name: `avatars`
- Public: `true`
- File size limit: `1MB`
- Allowed MIME types: `image/jpeg,image/png,image/webp`

### Certificates Bucket
- Name: `certificates`
- Public: `true`
- File size limit: `5MB`
- Allowed MIME types: `image/jpeg,image/png,image/webp,application/pdf`

## Step 5: Configure Storage Policies

Run these SQL commands in the SQL Editor to set up storage policies:

```sql
-- Avatars bucket policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Certificates bucket policies
CREATE POLICY "Users can upload their own certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own certificates" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Update App Configuration

1. In your Supabase dashboard, go to **Settings > API**
2. Copy your project URL and anon key
3. Update `src/services/supabaseConfig.js`:

```javascript
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
```

## Step 7: Test the Setup

1. Start your React Native app
2. Try registering a new user
3. Check your Supabase dashboard:
   - **Authentication > Users** should show the new user
   - **Table Editor > profiles** should show the user profile
4. Try logging in with the new user
5. Complete the profile setup
6. Verify the profile data is saved correctly

## Features Included

### Authentication
- ✅ Email/Password registration
- ✅ Email/Password login
- ✅ Password reset via email
- ✅ Email verification
- ✅ Session persistence
- ✅ Auto-refresh tokens

### User Profiles
- ✅ Complete athlete profiles
- ✅ Disability type and description
- ✅ Sports preferences and experience level
- ✅ Physical stats (height, weight)
- ✅ Location information
- ✅ Profile completion tracking

### Data Management
- ✅ Certificates storage and management
- ✅ Workout tracking
- ✅ Social posts
- ✅ Activity logging
- ✅ Training plans
- ✅ Coach profiles

### Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only access their own data
- ✅ Secure file uploads
- ✅ Protected API endpoints

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your Supabase URL and anon key are correct
   - Make sure there are no extra spaces or characters

2. **"User not found" during login**
   - Check if email verification is required
   - Verify the user exists in Authentication > Users

3. **Profile not loading**
   - Check if the profiles table was created correctly
   - Verify RLS policies are set up properly

4. **File upload errors**
   - Ensure storage buckets are created
   - Check storage policies are configured
   - Verify file size and type restrictions

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the SQL schema in `supabase/schema.sql`

## Next Steps

After setting up authentication, you can:

1. Customize email templates
2. Add social login providers (Google, Apple, etc.)
3. Implement role-based access control
4. Add real-time features with Supabase Realtime
5. Set up push notifications
6. Add analytics and monitoring

## Security Best Practices

1. **Never expose your service role key** - only use the anon key in your app
2. **Always use RLS policies** to protect user data
3. **Validate data on the server side** using database constraints
4. **Use HTTPS only** for all API calls
5. **Regularly update dependencies** to patch security vulnerabilities
6. **Monitor authentication logs** for suspicious activity

## Environment Variables

For production apps, store sensitive configuration in environment variables:

```javascript
// Use environment variables in production
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

Create a `.env` file (don't commit to git):
```
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
