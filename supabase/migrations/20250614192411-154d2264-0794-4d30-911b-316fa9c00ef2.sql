
-- Add foreign key constraint between catalogue_items and product_configs
ALTER TABLE catalogue_items 
ADD CONSTRAINT fk_catalogue_items_product_config 
FOREIGN KEY (product_config_id) 
REFERENCES product_configs(id) 
ON DELETE CASCADE;

-- Also add foreign key constraint between catalogue_items and catalogues
ALTER TABLE catalogue_items 
ADD CONSTRAINT fk_catalogue_items_catalogue 
FOREIGN KEY (catalogue_id) 
REFERENCES catalogues(id) 
ON DELETE CASCADE;
