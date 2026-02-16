-- Add ride_link column to rides table
-- This column stores the Uber/Ola/Rapido link for ride cost splitting
-- Run this migration in Supabase SQL Editor

ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS ride_link TEXT;

-- Create index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_rides_ride_link ON rides(ride_link);
