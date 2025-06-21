
-- Seed data for staging environment
-- This file contains sample data for testing and development

-- Insert sample merchants
INSERT INTO public.merchants (id, name, email, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Acme Manufacturing', 'admin@acme.com', '+1-555-0100', '123 Industrial Blvd, Manufacturing City, ST 12345'),
('550e8400-e29b-41d4-a716-446655440001', 'Beta Corp', 'contact@beta.com', '+1-555-0200', '456 Business Ave, Commerce Town, ST 67890');

-- Insert sample profiles (users)
INSERT INTO public.profiles (id, merchant_id, first_name, last_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'John', 'Admin', 'admin'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Jane', 'Manager', 'manager'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Bob', 'Smith', 'admin');

-- Insert sample user roles
INSERT INTO public.user_roles (user_id, merchant_id, role, permissions, assigned_by) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'admin', '{"all": true}', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'manager', '{"orders": true, "inventory": true}', '550e8400-e29b-41d4-a716-446655440010');

-- Insert sample material types
INSERT INTO public.material_types (merchant_id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Metal', 'Various metal materials'),
('550e8400-e29b-41d4-a716-446655440000', 'Plastic', 'Plastic and polymer materials'),
('550e8400-e29b-41d4-a716-446655440000', 'Fabric', 'Textile and fabric materials'),
('550e8400-e29b-41d4-a716-446655440000', 'Chemical', 'Chemical compounds and solutions');

-- Insert sample suppliers
INSERT INTO public.suppliers (merchant_id, company_name, contact_person, phone, email, whatsapp_number, materials_supplied, payment_terms) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'MetalWorks Inc', 'Sarah Johnson', '+1-555-1001', 'sarah@metalworks.com', '+1-555-1001', ARRAY['Steel', 'Aluminum', 'Copper'], 'Net 30'),
('550e8400-e29b-41d4-a716-446655440000', 'PlasticSupply Co', 'Mike Chen', '+1-555-1002', 'mike@plasticsupply.com', '+1-555-1002', ARRAY['PVC', 'ABS', 'Polyethylene'], 'Net 15'),
('550e8400-e29b-41d4-a716-446655440000', 'ChemCorp Ltd', 'Lisa Wong', '+1-555-1003', 'lisa@chemcorp.com', '+1-555-1003', ARRAY['Adhesive', 'Solvent', 'Paint'], 'COD');

-- Insert sample raw materials
INSERT INTO public.raw_materials (merchant_id, name, type, unit, current_stock, minimum_stock, required, cost_per_unit) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Steel Rod 10mm', 'Metal', 'pieces', 500, 100, 250, 5.50),
('550e8400-e29b-41d4-a716-446655440000', 'Aluminum Sheet 2mm', 'Metal', 'sheets', 200, 50, 100, 12.75),
('550e8400-e29b-41d4-a716-446655440000', 'PVC Pipe 1inch', 'Plastic', 'meters', 1000, 200, 300, 3.25),
('550e8400-e29b-41d4-a716-446655440000', 'Industrial Adhesive', 'Chemical', 'liters', 50, 10, 25, 18.90),
('550e8400-e29b-41d4-a716-446655440000', 'Cotton Fabric', 'Fabric', 'meters', 800, 150, 200, 8.50);

-- Insert sample product configs
INSERT INTO public.product_configs (merchant_id, product_code, category, subcategory, size_value, weight_range, threshold) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'CHAIR-001', 'Furniture', 'Chair', 45.5, '5-10kg', 20),
('550e8400-e29b-41d4-a716-446655440000', 'TABLE-001', 'Furniture', 'Table', 120.0, '15-25kg', 10),
('550e8400-e29b-41d4-a716-446655440000', 'LAMP-001', 'Electronics', 'Table Lamp', 25.0, '1-3kg', 50),
('550e8400-e29b-41d4-a716-446655440000', 'SHELF-001', 'Furniture', 'Shelf', 80.0, '8-12kg', 15);

-- Get product config IDs for references
-- Insert sample finished goods
INSERT INTO public.finished_goods (merchant_id, product_config_id, product_code, current_stock, threshold, required_quantity) 
SELECT 
    pc.merchant_id,
    pc.id,
    pc.product_code,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 45
        WHEN pc.product_code = 'TABLE-001' THEN 12
        WHEN pc.product_code = 'LAMP-001' THEN 88
        WHEN pc.product_code = 'SHELF-001' THEN 23
    END as current_stock,
    pc.threshold,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 75
        WHEN pc.product_code = 'TABLE-001' THEN 25
        WHEN pc.product_code = 'LAMP-001' THEN 30
        WHEN pc.product_code = 'SHELF-001' THEN 40
    END as required_quantity
FROM public.product_configs pc 
WHERE pc.merchant_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sample customers
INSERT INTO public.customers (merchant_id, name, phone, email, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ABC Corporation', '+1-555-2001', 'orders@abc-corp.com', '789 Business Plaza, Downtown, ST 11111'),
('550e8400-e29b-41d4-a716-446655440000', 'XYZ Enterprises', '+1-555-2002', 'purchasing@xyz-ent.com', '321 Commerce Center, Uptown, ST 22222'),
('550e8400-e29b-41d4-a716-446655440000', 'Home & Garden Store', '+1-555-2003', 'buyer@homeandgarden.com', '654 Retail Row, Suburban, ST 33333');

-- Insert sample workers
INSERT INTO public.workers (merchant_id, name, role, contact_number, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Carlos Rodriguez', 'Assembly Technician', '+1-555-3001', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Maria Garcia', 'Quality Control', '+1-555-3002', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'David Kim', 'Machine Operator', '+1-555-3003', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Jennifer Liu', 'Finishing Specialist', '+1-555-3004', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Robert Johnson', 'Assembly Lead', '+1-555-3005', 'On Leave');

-- Insert sample manufacturing steps
INSERT INTO public.manufacturing_steps (merchant_id, step_name, step_order, description, estimated_duration_hours, qc_required) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Material Preparation', 1, 'Cut and prepare raw materials', 4, false),
('550e8400-e29b-41d4-a716-446655440000', 'Assembly', 2, 'Assemble main components', 8, false),
('550e8400-e29b-41d4-a716-446655440000', 'Quality Check', 3, 'Inspect assembled product', 2, true),
('550e8400-e29b-41d4-a716-446655440000', 'Finishing', 4, 'Apply finish and final touches', 6, false),
('550e8400-e29b-41d4-a716-446655440000', 'Final Inspection', 5, 'Final quality control check', 1, true);

-- Insert sample orders
INSERT INTO public.orders (merchant_id, customer_id, order_number, total_amount, status, expected_delivery)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    c.id,
    CASE 
        WHEN c.name = 'ABC Corporation' THEN 'OD000001'
        WHEN c.name = 'XYZ Enterprises' THEN 'OD000002'
        WHEN c.name = 'Home & Garden Store' THEN 'OD000003'
    END,
    CASE 
        WHEN c.name = 'ABC Corporation' THEN 2250.00
        WHEN c.name = 'XYZ Enterprises' THEN 1800.00
        WHEN c.name = 'Home & Garden Store' THEN 3200.00
    END,
    CASE 
        WHEN c.name = 'ABC Corporation' THEN 'In Progress'::order_status
        WHEN c.name = 'XYZ Enterprises' THEN 'Created'::order_status
        WHEN c.name = 'Home & Garden Store' THEN 'Ready'::order_status
    END,
    CURRENT_DATE + INTERVAL '14 days'
FROM public.customers c 
WHERE c.merchant_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sample order items
INSERT INTO public.order_items (merchant_id, order_id, product_config_id, suborder_id, quantity, unit_price, total_price, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    o.id,
    pc.id,
    CASE 
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'CHAIR-001' THEN 'S-OD000001-01'
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'TABLE-001' THEN 'S-OD000001-02'
        WHEN o.order_number = 'OD000002' AND pc.product_code = 'LAMP-001' THEN 'S-OD000002-01'
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'SHELF-001' THEN 'S-OD000003-01'
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'CHAIR-001' THEN 'S-OD000003-02'
    END,
    CASE 
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'CHAIR-001' THEN 10
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'TABLE-001' THEN 5
        WHEN o.order_number = 'OD000002' AND pc.product_code = 'LAMP-001' THEN 20
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'SHELF-001' THEN 8
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'CHAIR-001' THEN 15
    END,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 75.00
        WHEN pc.product_code = 'TABLE-001' THEN 150.00
        WHEN pc.product_code = 'LAMP-001' THEN 45.00
        WHEN pc.product_code = 'SHELF-001' THEN 120.00
    END,
    CASE 
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'CHAIR-001' THEN 750.00
        WHEN o.order_number = 'OD000001' AND pc.product_code = 'TABLE-001' THEN 750.00
        WHEN o.order_number = 'OD000002' AND pc.product_code = 'LAMP-001' THEN 900.00
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'SHELF-001' THEN 960.00
        WHEN o.order_number = 'OD000003' AND pc.product_code = 'CHAIR-001' THEN 1125.00
    END,
    o.status
FROM public.orders o
CROSS JOIN public.product_configs pc
WHERE o.merchant_id = '550e8400-e29b-41d4-a716-446655440000'
AND pc.merchant_id = '550e8400-e29b-41d4-a716-446655440000'
AND (
    (o.order_number = 'OD000001' AND pc.product_code IN ('CHAIR-001', 'TABLE-001')) OR
    (o.order_number = 'OD000002' AND pc.product_code = 'LAMP-001') OR
    (o.order_number = 'OD000003' AND pc.product_code IN ('SHELF-001', 'CHAIR-001'))
);

-- Insert sample manufacturing orders
INSERT INTO public.manufacturing_orders (order_number, product_name, product_type, product_config_id, quantity_required, priority, status, due_date, merchant_id)
SELECT 
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 'MO000001'
        WHEN pc.product_code = 'TABLE-001' THEN 'MO000002'
        WHEN pc.product_code = 'LAMP-001' THEN 'MO000003'
    END,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 'Ergonomic Office Chair'
        WHEN pc.product_code = 'TABLE-001' THEN 'Conference Table'
        WHEN pc.product_code = 'LAMP-001' THEN 'LED Desk Lamp'
    END,
    pc.category,
    pc.id,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 50
        WHEN pc.product_code = 'TABLE-001' THEN 20
        WHEN pc.product_code = 'LAMP-001' THEN 100
    END,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 'high'
        WHEN pc.product_code = 'TABLE-001' THEN 'medium'
        WHEN pc.product_code = 'LAMP-001' THEN 'urgent'
    END,
    CASE 
        WHEN pc.product_code = 'CHAIR-001' THEN 'in_progress'
        WHEN pc.product_code = 'TABLE-001' THEN 'pending'
        WHEN pc.product_code = 'LAMP-001' THEN 'completed'
    END,
    CURRENT_DATE + INTERVAL '21 days',
    '550e8400-e29b-41d4-a716-446655440000'
FROM public.product_configs pc 
WHERE pc.merchant_id = '550e8400-e29b-41d4-a716-446655440000'
AND pc.product_code IN ('CHAIR-001', 'TABLE-001', 'LAMP-001');

-- Insert sample procurement requests
INSERT INTO public.procurement_requests (merchant_id, raw_material_id, supplier_id, request_number, quantity_requested, unit, status, eta, first_name, last_name, notes)
SELECT 
    rm.merchant_id,
    rm.id,
    s.id,
    CASE 
        WHEN rm.name = 'Steel Rod 10mm' THEN 'PR000001'
        WHEN rm.name = 'Aluminum Sheet 2mm' THEN 'PR000002'
        WHEN rm.name = 'PVC Pipe 1inch' THEN 'PR000003'
    END,
    CASE 
        WHEN rm.name = 'Steel Rod 10mm' THEN 200
        WHEN rm.name = 'Aluminum Sheet 2mm' THEN 100
        WHEN rm.name = 'PVC Pipe 1inch' THEN 500
    END,
    rm.unit,
    CASE 
        WHEN rm.name = 'Steel Rod 10mm' THEN 'Approved'::procurement_status
        WHEN rm.name = 'Aluminum Sheet 2mm' THEN 'Pending'::procurement_status
        WHEN rm.name = 'PVC Pipe 1inch' THEN 'Ordered'::procurement_status
    END,
    CURRENT_DATE + INTERVAL '7 days',
    'John',
    'Admin',
    'Urgent requirement for production'
FROM public.raw_materials rm
JOIN public.suppliers s ON s.merchant_id = rm.merchant_id
WHERE rm.merchant_id = '550e8400-e29b-41d4-a716-446655440000'
AND rm.name IN ('Steel Rod 10mm', 'Aluminum Sheet 2mm', 'PVC Pipe 1inch')
AND (
    (rm.name = 'Steel Rod 10mm' AND s.company_name = 'MetalWorks Inc') OR
    (rm.name = 'Aluminum Sheet 2mm' AND s.company_name = 'MetalWorks Inc') OR
    (rm.name = 'PVC Pipe 1inch' AND s.company_name = 'PlasticSupply Co')
);

-- Insert sample catalogues
INSERT INTO public.catalogues (merchant_id, name, description, public_url_slug) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Office Furniture Collection', 'Premium office furniture for modern workspaces', 'office-furniture-2024'),
('550e8400-e29b-41d4-a716-446655440000', 'Home Lighting Solutions', 'Energy-efficient lighting for your home', 'home-lighting-catalog');

-- Insert sample error configurations
INSERT INTO public.error_configurations (error_code, error_type, title, message, description, possible_causes, action_items, is_retryable, severity) VALUES
('VALIDATION_001', 'validation', 'Invalid Input Data', 'The provided data does not meet validation requirements', 'Input validation failed for required fields', ARRAY['Missing required fields', 'Invalid data format', 'Data exceeds maximum length'], ARRAY['Check all required fields are filled', 'Verify data format matches requirements', 'Reduce input length if needed'], false, 'medium'),
('NETWORK_001', 'network', 'Connection Timeout', 'Request timed out while connecting to server', 'Network request exceeded timeout threshold', ARRAY['Slow internet connection', 'Server overload', 'Network congestion'], ARRAY['Check internet connection', 'Retry the request', 'Contact support if issue persists'], true, 'high'),
('AUTH_001', 'auth', 'Authentication Failed', 'Unable to authenticate user credentials', 'User authentication could not be verified', ARRAY['Invalid credentials', 'Expired session', 'Account locked'], ARRAY['Verify username and password', 'Login again', 'Contact administrator'], false, 'high');

-- Log sample user activities
INSERT INTO public.user_activity_log (user_id, user_name, action, entity_type, entity_id, description, merchant_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'John Admin', 'CREATE', 'order', 'OD000001', 'Created new order for ABC Corporation', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440010', 'John Admin', 'UPDATE', 'manufacturing_order', 'MO000001', 'Updated manufacturing order status to in_progress', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440011', 'Jane Manager', 'CREATE', 'procurement_request', 'PR000001', 'Created procurement request for Steel Rod 10mm', '550e8400-e29b-41d4-a716-446655440000');
