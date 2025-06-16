
-- Drop all triggers that depend on the functions first
DROP TRIGGER IF EXISTS trigger_update_previous_steps_data ON manufacturing_order_steps;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_values_change ON manufacturing_order_step_values;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_step_insert ON manufacturing_order_steps;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_step_update ON manufacturing_order_steps;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_step_delete ON manufacturing_order_steps;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_values_insert ON manufacturing_order_step_values;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_values_update ON manufacturing_order_step_values;
DROP TRIGGER IF EXISTS trigger_update_previous_steps_on_values_delete ON manufacturing_order_step_values;

-- Now drop the trigger functions
DROP FUNCTION IF EXISTS public.update_previous_steps_data();
DROP FUNCTION IF EXISTS public.update_previous_steps_on_values_change();
