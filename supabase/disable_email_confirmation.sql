-- IMPORTANT: This SQL method does NOT work in Supabase!
-- The auth.config table is not accessible via SQL.

-- ❌ This will NOT work:
-- UPDATE auth.config SET email_confirm_required = false WHERE id = 1;

-- ✅ CORRECT METHOD: Use Supabase Dashboard
-- 1. Go to Authentication → Settings
-- 2. Find "Enable email confirmations" 
-- 3. Toggle it OFF
-- 4. Click Save

-- ✅ ALTERNATIVE: Environment Variable
-- 1. Go to Settings → Environment variables
-- 2. Add: GOTRUE_MAILER_AUTOCONFIRM = true
-- 3. Save and restart project

-- This is just a reminder file - the actual configuration must be done via the dashboard.
SELECT 'Use Supabase Dashboard to disable email confirmation!' as instruction;
