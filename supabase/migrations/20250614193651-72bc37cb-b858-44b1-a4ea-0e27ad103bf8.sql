
-- Enable RLS on the tables. It's safe to run this even if it's already enabled.
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_configs ENABLE ROW LEVEL SECURITY;

-- Policies for 'catalogues' table
DROP POLICY IF EXISTS "Public can view active catalogues" ON public.catalogues;
CREATE POLICY "Public can view active catalogues"
ON public.catalogues
FOR SELECT
TO anon
USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage their own catalogues" ON public.catalogues;
CREATE POLICY "Users can manage their own catalogues"
ON public.catalogues
FOR ALL
TO authenticated
USING (merchant_id = get_user_merchant_id())
WITH CHECK (merchant_id = get_user_merchant_id());

-- Policies for 'catalogue_items' table
DROP POLICY IF EXISTS "Public can view any catalogue items" ON public.catalogue_items;
CREATE POLICY "Public can view any catalogue items"
ON public.catalogue_items
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Users can manage their own catalogue items" ON public.catalogue_items;
CREATE POLICY "Users can manage their own catalogue items"
ON public.catalogue_items
FOR ALL
TO authenticated
USING (catalogue_id IN (SELECT id FROM catalogues WHERE merchant_id = get_user_merchant_id()))
WITH CHECK (catalogue_id IN (SELECT id FROM catalogues WHERE merchant_id = get_user_merchant_id()));

-- Policies for 'product_configs' table
DROP POLICY IF EXISTS "Public can view active product configs" ON public.product_configs;
CREATE POLICY "Public can view active product configs"
ON public.product_configs
FOR SELECT
TO anon
USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage their own product configs" ON public.product_configs;
CREATE POLICY "Users can manage their own product configs"
ON public.product_configs
FOR ALL
TO authenticated
USING (merchant_id = get_user_merchant_id())
WITH CHECK (merchant_id = get_user_merchant_id());
