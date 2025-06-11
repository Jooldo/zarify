
-- Update product_configs threshold using finished_goods threshold where it's currently null
UPDATE product_configs 
SET threshold = fg.threshold
FROM finished_goods fg
WHERE product_configs.id = fg.product_config_id 
AND product_configs.threshold IS NULL 
AND fg.threshold IS NOT NULL;
