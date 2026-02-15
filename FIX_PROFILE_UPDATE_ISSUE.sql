-- ==========================================
-- FIX PROFILE UPDATE PERSISTENCE
-- ==========================================

-- 1. Grant Permissions (Crucial for RLS to work)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Ensure Profiles Table Correctness
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    email TEXT,
    name TEXT,
    phone VARCHAR,
    department VARCHAR,
    year VARCHAR,
    gender VARCHAR,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    trust_score DECIMAL DEFAULT 4.0,
    profile_complete BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure the column definitely exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_complete') THEN
        ALTER TABLE profiles ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Reset RLS Policies for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;
DROP POLICY IF EXISTS "Enable read for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create CLEAN, PERMISSIVE policies
-- Allow INSERT if ID matches auth.uid()
CREATE POLICY "Enable insert for users"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow SELECT for all authenticated users (so they can see each other's basic info)
CREATE POLICY "Enable read for all users"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow UPDATE if ID matches auth.uid()
CREATE POLICY "Enable update for users"
ON profiles FOR UPDATE
USING (auth.uid() = id);
-- Note: update policy often doesn't need WITH CHECK for same-row updates unless keys change

-- 4. Create Users table if it's missing (referenced in AuthContext)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    trust_score DECIMAL DEFAULT 100,
    account_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Reset RLS for Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can view users" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view users" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid() = id);
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- 5. Diagnostic: Check if profile_complete is actually updated for recent users
SELECT id, email, profile_complete, updated_at FROM profiles ORDER BY updated_at DESC LIMIT 5;

SELECT '✅ Permissions and Policies Fixed. Please try logging in again.' as status;
