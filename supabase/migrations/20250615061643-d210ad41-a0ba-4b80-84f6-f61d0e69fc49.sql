
-- Create a public bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', TRUE);

-- RLS Policies for product_images bucket

-- 1. Allow public read access to all files in the bucket
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product_images' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product_images' );

-- 3. Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'product_images' );

-- 4. Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product_images' );
