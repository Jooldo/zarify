
-- Change the required field in raw_materials table from integer to numeric to support decimal values
ALTER TABLE raw_materials ALTER COLUMN required TYPE numeric;
