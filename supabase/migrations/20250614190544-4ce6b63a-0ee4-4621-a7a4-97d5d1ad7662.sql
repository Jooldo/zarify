
-- Create catalogues table for merchant-created product collections
CREATE TABLE public.catalogues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  public_url_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogue_items table to store SKUs in each catalogue
CREATE TABLE public.catalogue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id UUID NOT NULL REFERENCES public.catalogues(id) ON DELETE CASCADE,
  product_config_id UUID NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  custom_price NUMERIC,
  custom_description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogue_categories table for organizing items
CREATE TABLE public.catalogue_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id UUID NOT NULL REFERENCES public.catalogues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogue_item_categories junction table
CREATE TABLE public.catalogue_item_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_item_id UUID NOT NULL REFERENCES public.catalogue_items(id) ON DELETE CASCADE,
  catalogue_category_id UUID NOT NULL REFERENCES public.catalogue_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create catalogue_orders table for customer order requests
CREATE TABLE public.catalogue_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id UUID NOT NULL REFERENCES public.catalogues(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  order_items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  order_id UUID -- Reference to created order after processing
);

-- Add RLS policies for catalogues
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage their own catalogues" 
  ON public.catalogues 
  FOR ALL 
  USING (
    merchant_id IN (
      SELECT get_user_merchant_id()
    )
  );

CREATE POLICY "Public can view active catalogues" 
  ON public.catalogues 
  FOR SELECT 
  USING (is_active = true);

-- Add RLS policies for catalogue_items
ALTER TABLE public.catalogue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage items in their catalogues" 
  ON public.catalogue_items 
  FOR ALL 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE merchant_id = get_user_merchant_id()
    )
  );

CREATE POLICY "Public can view items in active catalogues" 
  ON public.catalogue_items 
  FOR SELECT 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE is_active = true
    )
  );

-- Add RLS policies for catalogue_categories
ALTER TABLE public.catalogue_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage categories in their catalogues" 
  ON public.catalogue_categories 
  FOR ALL 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE merchant_id = get_user_merchant_id()
    )
  );

CREATE POLICY "Public can view categories in active catalogues" 
  ON public.catalogue_categories 
  FOR SELECT 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE is_active = true
    )
  );

-- Add RLS policies for catalogue_item_categories
ALTER TABLE public.catalogue_item_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage item categories in their catalogues" 
  ON public.catalogue_item_categories 
  FOR ALL 
  USING (
    catalogue_item_id IN (
      SELECT ci.id FROM public.catalogue_items ci
      JOIN public.catalogues c ON ci.catalogue_id = c.id
      WHERE c.merchant_id = get_user_merchant_id()
    )
  );

CREATE POLICY "Public can view item categories in active catalogues" 
  ON public.catalogue_item_categories 
  FOR SELECT 
  USING (
    catalogue_item_id IN (
      SELECT ci.id FROM public.catalogue_items ci
      JOIN public.catalogues c ON ci.catalogue_id = c.id
      WHERE c.is_active = true
    )
  );

-- Add RLS policies for catalogue_orders
ALTER TABLE public.catalogue_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view orders for their catalogues" 
  ON public.catalogue_orders 
  FOR SELECT 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE merchant_id = get_user_merchant_id()
    )
  );

CREATE POLICY "Merchants can update orders for their catalogues" 
  ON public.catalogue_orders 
  FOR UPDATE 
  USING (
    catalogue_id IN (
      SELECT id FROM public.catalogues WHERE merchant_id = get_user_merchant_id()
    )
  );

CREATE POLICY "Public can create catalogue orders" 
  ON public.catalogue_orders 
  FOR INSERT 
  WITH CHECK (true);

-- Add updated_at trigger for catalogues
CREATE TRIGGER update_catalogues_updated_at 
  BEFORE UPDATE ON public.catalogues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique catalogue URL slug
CREATE OR REPLACE FUNCTION generate_catalogue_slug(catalogue_name TEXT, merchant_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from catalogue name
    base_slug := lower(regexp_replace(catalogue_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- If empty, use default
    IF base_slug = '' THEN
        base_slug := 'catalogue';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.catalogues WHERE public_url_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN final_slug;
END;
$$;
