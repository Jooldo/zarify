
-- Initial schema migration
-- This migration creates the foundational database structure
-- Generated on: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

-- Create custom types first
CREATE TYPE public.order_status AS ENUM ('Created', 'In Progress', 'Ready', 'Delivered', 'Partially Fulfilled');
CREATE TYPE public.procurement_status AS ENUM ('None', 'Pending', 'Approved', 'Ordered', 'Received', 'Cancelled');
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE public.worker_status AS ENUM ('Active', 'Inactive', 'On Leave');

-- Create foundational tables
CREATE TABLE public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id),
    first_name TEXT,
    last_name TEXT,
    role public.user_role DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add other core tables...
-- (The rest of the schema from the comprehensive script above)
-- This is abbreviated for the migration file structure

-- Create triggers and functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Add RLS for other tables as needed

-- Create basic RLS policies
CREATE POLICY "Users can view their merchant data" ON public.merchants
    FOR SELECT USING (id = get_user_merchant_id());

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_profiles_merchant_id ON public.profiles(merchant_id);
CREATE INDEX idx_merchants_email ON public.merchants(email);
