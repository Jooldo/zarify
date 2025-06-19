
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view roles in their merchant" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their merchant" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Create a security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.check_user_has_admin_role()
RETURNS BOOLEAN AS $$
DECLARE
    user_merchant_id UUID;
    has_admin_role BOOLEAN := FALSE;
BEGIN
    -- Get user's merchant ID
    SELECT merchant_id INTO user_merchant_id
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- If no merchant found, return false
    IF user_merchant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has admin role (bypass RLS by using security definer)
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND merchant_id = user_merchant_id 
        AND role = 'admin' 
        AND is_active = true
    ) INTO has_admin_role;
    
    RETURN has_admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simpler RLS policies that don't cause recursion
CREATE POLICY "Users can view roles in their merchant" 
ON public.user_roles FOR SELECT 
USING (merchant_id = get_user_merchant_id());

CREATE POLICY "Admins can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (merchant_id = get_user_merchant_id() AND check_user_has_admin_role());

CREATE POLICY "Admins can update roles" 
ON public.user_roles FOR UPDATE 
USING (merchant_id = get_user_merchant_id() AND check_user_has_admin_role());

CREATE POLICY "Admins can delete roles" 
ON public.user_roles FOR DELETE 
USING (merchant_id = get_user_merchant_id() AND check_user_has_admin_role());

-- Update the has_role function to be more robust
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_merchant_id UUID;
BEGIN
    -- Get user's merchant ID
    SELECT merchant_id INTO user_merchant_id
    FROM public.profiles 
    WHERE id = _user_id;
    
    -- If no merchant found, return false
    IF user_merchant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has the specified role
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _user_id 
        AND role = _role 
        AND is_active = true
        AND merchant_id = user_merchant_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
