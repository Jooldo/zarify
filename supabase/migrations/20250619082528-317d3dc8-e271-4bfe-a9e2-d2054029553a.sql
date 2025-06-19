
-- Create user roles table with proper structure
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker', 'operator', 'viewer')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, merchant_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view roles in their merchant" 
ON public.user_roles FOR SELECT 
USING (merchant_id = get_user_merchant_id());

CREATE POLICY "Admins can manage roles in their merchant" 
ON public.user_roles FOR ALL 
USING (merchant_id = get_user_merchant_id() AND 
       EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.merchant_id = get_user_merchant_id() AND ur.role = 'admin' AND ur.is_active = true));

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (merchant_id = get_user_merchant_id());

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _user_id 
        AND role = _role 
        AND is_active = true
        AND merchant_id = get_user_merchant_id()
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    role TEXT,
    permissions JSONB,
    is_active BOOLEAN,
    assigned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.role,
        ur.permissions,
        ur.is_active,
        ur.assigned_at
    FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(_user_id, auth.uid())
    AND ur.merchant_id = get_user_merchant_id()
    AND ur.is_active = true
    ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
CREATE TRIGGER update_user_roles_updated_at 
BEFORE UPDATE ON public.user_roles 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_user_roles_user_merchant 
ON public.user_roles(user_id, merchant_id, is_active);

CREATE INDEX idx_user_roles_role_active 
ON public.user_roles(role, is_active, merchant_id);

-- Insert default admin role for existing users
INSERT INTO public.user_roles (user_id, merchant_id, role, assigned_by, permissions)
SELECT 
    p.id,
    p.merchant_id,
    'admin',
    p.id,
    '{"all": true}'::jsonb
FROM public.profiles p
WHERE p.role = 'admin'
ON CONFLICT (user_id, merchant_id, role) DO NOTHING;
