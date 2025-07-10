-- Add selfie verification field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_verified BOOLEAN DEFAULT false;