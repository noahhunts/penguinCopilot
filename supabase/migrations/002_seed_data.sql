-- SAP Copilot Demo - Seed Data
-- Realistic SAP-like data for demonstration

-- Vendors (LFA1)
INSERT INTO lfa1 (lifnr, name1, name2, stras, ort01, pstlz, regio, telf1, stcd1) VALUES
('0000001000', 'Acme Industrial Supply', 'Inc.', '123 Industrial Parkway', 'Chicago', '60601', 'IL', '+1-312-555-1234', '12-3456789'),
('0000001001', 'Global Manufacturing Corp', 'East Division', '500 Factory Lane', 'Detroit', '48201', 'MI', '+1-313-555-5678', '23-4567890'),
('0000001002', 'Pacific Components Ltd', '', '789 Tech Boulevard', 'San Jose', '95110', 'CA', '+1-408-555-9012', '34-5678901'),
('0000001003', 'European Motors GmbH', 'NA Branch', '456 Import Drive', 'Newark', '07102', 'NJ', '+1-973-555-3456', '45-6789012'),
('0000001004', 'Midwest Steel & Alloys', 'LLC', '321 Foundry Road', 'Cleveland', '44101', 'OH', '+1-216-555-7890', '56-7890123'),
('0000001005', 'Southern Electronics Inc', '', '888 Circuit Way', 'Austin', '78701', 'TX', '+1-512-555-2345', '67-8901234'),
('0000001006', 'Advanced Plastics Corp', '', '777 Polymer Street', 'Houston', '77001', 'TX', '+1-713-555-6789', '78-9012345'),
('0000001007', 'Precision Tools & Dies', 'Co.', '555 Machining Ave', 'Milwaukee', '53201', 'WI', '+1-414-555-0123', '89-0123456'),
('0000001008', 'Asian Tech Imports', 'LLC', '999 Harbor Way', 'Los Angeles', '90001', 'CA', '+1-213-555-4567', '90-1234567'),
('0000001009', 'Quality Fasteners Inc', '', '222 Bolt Lane', 'Pittsburgh', '15201', 'PA', '+1-412-555-8901', '01-2345678')
ON CONFLICT (lifnr) DO NOTHING;

-- Customers (KNA1)
INSERT INTO kna1 (kunnr, name1, name2, stras, ort01, pstlz, regio, telf1, credit_limit) VALUES
('0000001500', 'TechFlow Industries', 'Main Campus', '1000 Innovation Way', 'Seattle', '98101', 'WA', '+1-206-555-1111', 500000),
('0000001501', 'AutoParts Unlimited', '', '2500 Dealer Row', 'Dallas', '75201', 'TX', '+1-214-555-2222', 750000),
('0000001502', 'Mega Construction Co', 'Projects Division', '3000 Builder Blvd', 'Phoenix', '85001', 'AZ', '+1-602-555-3333', 1000000),
('0000001503', 'SmartHome Systems', 'Inc.', '4000 Connected Drive', 'Denver', '80201', 'CO', '+1-303-555-4444', 300000),
('0000001504', 'Energy Solutions Corp', '', '5000 Power Street', 'Houston', '77002', 'TX', '+1-713-555-5555', 2000000),
('0000001505', 'Medical Devices Plus', 'LLC', '6000 Health Lane', 'Boston', '02101', 'MA', '+1-617-555-6666', 1500000),
('0000001506', 'Aerospace Components Inc', '', '7000 Flight Path', 'Wichita', '67201', 'KS', '+1-316-555-7777', 3000000),
('0000001507', 'Green Tech Solutions', '', '8000 Eco Way', 'Portland', '97201', 'OR', '+1-503-555-8888', 400000),
('0000001508', 'Marine Equipment Co', '', '9000 Harbor View', 'Miami', '33101', 'FL', '+1-305-555-9999', 600000),
('0000001509', 'Rail Transport Systems', '', '1100 Track Lane', 'Chicago', '60602', 'IL', '+1-312-555-0000', 800000)
ON CONFLICT (kunnr) DO NOTHING;

-- Materials (MARA + MAKT + MARC + MARD)
-- Motors
INSERT INTO mara (matnr, mtart, matkl, meins, brgew, ntgew, volum) VALUES
('MAT-10001', 'FERT', 'MOTORS', 'EA', 15.5, 14.2, 0.025),
('MAT-10002', 'FERT', 'MOTORS', 'EA', 22.0, 20.5, 0.035),
('MAT-10003', 'FERT', 'MOTORS', 'EA', 8.5, 7.8, 0.015)
ON CONFLICT (matnr) DO NOTHING;

INSERT INTO makt (matnr, spras, maktx) VALUES
('MAT-10001', 'E', 'Industrial Pump Motor 5HP'),
('MAT-10002', 'E', 'Industrial Pump Motor 10HP'),
('MAT-10003', 'E', 'HVAC Blower Motor 2HP')
ON CONFLICT (matnr, spras) DO NOTHING;

INSERT INTO marc (matnr, werks, stdprice) VALUES
('MAT-10001', '1000', 450.00),
('MAT-10002', '1000', 785.00),
('MAT-10003', '1000', 225.00)
ON CONFLICT (matnr, werks) DO NOTHING;

INSERT INTO mard (matnr, werks, lgort, labst) VALUES
('MAT-10001', '1000', '0001', 250),
('MAT-10002', '1000', '0001', 125),
('MAT-10003', '1000', '0001', 400)
ON CONFLICT (matnr, werks, lgort) DO NOTHING;

-- Bearings
INSERT INTO mara (matnr, mtart, matkl, meins, brgew, ntgew, volum) VALUES
('MAT-20001', 'HALB', 'BEARING', 'EA', 0.45, 0.42, 0.001),
('MAT-20002', 'HALB', 'BEARING', 'EA', 0.85, 0.80, 0.002),
('MAT-20003', 'HALB', 'BEARING', 'EA', 1.20, 1.15, 0.003)
ON CONFLICT (matnr) DO NOTHING;

INSERT INTO makt (matnr, spras, maktx) VALUES
('MAT-20001', 'E', 'Ball Bearing 6205-2RS'),
('MAT-20002', 'E', 'Roller Bearing 22210'),
('MAT-20003', 'E', 'Thrust Bearing 51107')
ON CONFLICT (matnr, spras) DO NOTHING;

INSERT INTO marc (matnr, werks, stdprice) VALUES
('MAT-20001', '1000', 12.50),
('MAT-20002', '1000', 45.00),
('MAT-20003', '1000', 28.00)
ON CONFLICT (matnr, werks) DO NOTHING;

INSERT INTO mard (matnr, werks, lgort, labst) VALUES
('MAT-20001', '1000', '0001', 5000),
('MAT-20002', '1000', '0001', 2500),
('MAT-20003', '1000', '0001', 3200)
ON CONFLICT (matnr, werks, lgort) DO NOTHING;

-- Pumps
INSERT INTO mara (matnr, mtart, matkl, meins, brgew, ntgew, volum) VALUES
('MAT-50001', 'FERT', 'PUMPS', 'EA', 35.0, 32.0, 0.05),
('MAT-50002', 'FERT', 'PUMPS', 'EA', 28.0, 25.5, 0.04),
('MAT-50003', 'FERT', 'PUMPS', 'EA', 18.0, 16.5, 0.03)
ON CONFLICT (matnr) DO NOTHING;

INSERT INTO makt (matnr, spras, maktx) VALUES
('MAT-50001', 'E', 'Centrifugal Pump CP-200'),
('MAT-50002', 'E', 'Gear Pump GP-150'),
('MAT-50003', 'E', 'Diaphragm Pump DP-100')
ON CONFLICT (matnr, spras) DO NOTHING;

INSERT INTO marc (matnr, werks, stdprice) VALUES
('MAT-50001', '1000', 1250.00),
('MAT-50002', '1000', 890.00),
('MAT-50003', '1000', 675.00)
ON CONFLICT (matnr, werks) DO NOTHING;

INSERT INTO mard (matnr, werks, lgort, labst) VALUES
('MAT-50001', '1000', '0001', 75),
('MAT-50002', '1000', '0001', 120),
('MAT-50003', '1000', '0001', 95)
ON CONFLICT (matnr, werks, lgort) DO NOTHING;

-- Valves
INSERT INTO mara (matnr, mtart, matkl, meins, brgew, ntgew, volum) VALUES
('MAT-60001', 'FERT', 'VALVES', 'EA', 4.5, 4.2, 0.008),
('MAT-60002', 'FERT', 'VALVES', 'EA', 2.8, 2.5, 0.005),
('MAT-60003', 'FERT', 'VALVES', 'EA', 6.2, 5.8, 0.01)
ON CONFLICT (matnr) DO NOTHING;

INSERT INTO makt (matnr, spras, maktx) VALUES
('MAT-60001', 'E', 'Gate Valve 2" 150LB'),
('MAT-60002', 'E', 'Ball Valve 1.5" SS316'),
('MAT-60003', 'E', 'Control Valve CV-3000')
ON CONFLICT (matnr, spras) DO NOTHING;

INSERT INTO marc (matnr, werks, stdprice) VALUES
('MAT-60001', '1000', 185.00),
('MAT-60002', '1000', 145.00),
('MAT-60003', '1000', 425.00)
ON CONFLICT (matnr, werks) DO NOTHING;

INSERT INTO mard (matnr, werks, lgort, labst) VALUES
('MAT-60001', '1000', '0001', 350),
('MAT-60002', '1000', '0001', 500),
('MAT-60003', '1000', '0001', 180)
ON CONFLICT (matnr, werks, lgort) DO NOTHING;

-- Additional materials for variety
INSERT INTO mara (matnr, mtart, matkl, meins, brgew, ntgew, volum) VALUES
('MAT-30001', 'ROH', 'ELEC', 'EA', 0.05, 0.045, 0.0001),
('MAT-30002', 'ROH', 'ELEC', 'EA', 0.12, 0.11, 0.0002),
('MAT-40001', 'ROH', 'STEEL', 'KG', 1.0, 1.0, 0.00013),
('MAT-40002', 'ROH', 'STEEL', 'KG', 1.0, 1.0, 0.00025),
('MAT-70001', 'ROH', 'FASTEN', 'EA', 0.025, 0.025, 0.000005),
('MAT-70002', 'ROH', 'FASTEN', 'EA', 0.008, 0.008, 0.000002),
('MAT-80001', 'FERT', 'HYDRA', 'EA', 12.0, 11.2, 0.015),
('MAT-80002', 'FERT', 'HYDRA', 'EA', 8.5, 8.0, 0.012),
('MAT-90001', 'ROH', 'SEALS', 'EA', 0.02, 0.02, 0.00001),
('MAT-90002', 'ROH', 'SEALS', 'EA', 0.15, 0.15, 0.0001)
ON CONFLICT (matnr) DO NOTHING;

INSERT INTO makt (matnr, spras, maktx) VALUES
('MAT-30001', 'E', 'Power Control Module PCM-500'),
('MAT-30002', 'E', 'Frequency Drive VFD-2000'),
('MAT-40001', 'E', 'Steel Rod 25mm Diameter'),
('MAT-40002', 'E', 'Steel Plate 10mm Thick'),
('MAT-70001', 'E', 'Hex Bolt M10x50 GR8.8'),
('MAT-70002', 'E', 'Hex Nut M10 GR8'),
('MAT-80001', 'E', 'Hydraulic Cylinder HC-50'),
('MAT-80002', 'E', 'Hydraulic Pump HP-25'),
('MAT-90001', 'E', 'O-Ring Viton 25mm'),
('MAT-90002', 'E', 'Spiral Wound Gasket DN50')
ON CONFLICT (matnr, spras) DO NOTHING;

INSERT INTO marc (matnr, werks, stdprice) VALUES
('MAT-30001', '1000', 125.00),
('MAT-30002', '1000', 350.00),
('MAT-40001', '1000', 2.85),
('MAT-40002', '1000', 3.25),
('MAT-70001', '1000', 0.45),
('MAT-70002', '1000', 0.15),
('MAT-80001', '1000', 580.00),
('MAT-80002', '1000', 725.00),
('MAT-90001', '1000', 2.50),
('MAT-90002', '1000', 18.00)
ON CONFLICT (matnr, werks) DO NOTHING;

INSERT INTO mard (matnr, werks, lgort, labst) VALUES
('MAT-30001', '1000', '0001', 800),
('MAT-30002', '1000', '0001', 450),
('MAT-40001', '1000', '0001', 25000),
('MAT-40002', '1000', '0001', 18000),
('MAT-70001', '1000', '0001', 50000),
('MAT-70002', '1000', '0001', 75000),
('MAT-80001', '1000', '0001', 85),
('MAT-80002', '1000', '0001', 65),
('MAT-90001', '1000', '0001', 25000),
('MAT-90002', '1000', '0001', 3500)
ON CONFLICT (matnr, werks, lgort) DO NOTHING;

-- Purchase Orders
INSERT INTO ekko (ebeln, lifnr, bedat, netwr) VALUES
('4500000100', '0000001000', CURRENT_DATE - INTERVAL '30 days', 45000.00),
('4500000101', '0000001001', CURRENT_DATE - INTERVAL '25 days', 78500.00),
('4500000102', '0000001002', CURRENT_DATE - INTERVAL '20 days', 12500.00),
('4500000103', '0000001003', CURRENT_DATE - INTERVAL '15 days', 34000.00),
('4500000104', '0000001004', CURRENT_DATE - INTERVAL '10 days', 8500.00),
('4500000105', '0000001005', CURRENT_DATE - INTERVAL '7 days', 15750.00),
('4500000106', '0000001006', CURRENT_DATE - INTERVAL '5 days', 22000.00),
('4500000107', '0000001007', CURRENT_DATE - INTERVAL '4 days', 29000.00),
('4500000108', '0000001008', CURRENT_DATE - INTERVAL '3 days', 11000.00),
('4500000109', '0000001009', CURRENT_DATE - INTERVAL '2 days', 22500.00),
('4500000110', '0000001000', CURRENT_DATE - INTERVAL '1 day', 45000.00),
('4500000111', '0000001000', CURRENT_DATE, 62500.00)
ON CONFLICT (ebeln) DO NOTHING;

-- Sales Orders
INSERT INTO vbak (vbeln, kunnr, erdat, netwr, bstnk) VALUES
('0000012300', '0000001500', CURRENT_DATE - INTERVAL '20 days', 125000.00, 'CUST-PO-001'),
('0000012301', '0000001501', CURRENT_DATE - INTERVAL '18 days', 89000.00, 'CUST-PO-002'),
('0000012302', '0000001502', CURRENT_DATE - INTERVAL '15 days', 250000.00, 'CUST-PO-003'),
('0000012303', '0000001503', CURRENT_DATE - INTERVAL '12 days', 45000.00, 'CUST-PO-004'),
('0000012304', '0000001504', CURRENT_DATE - INTERVAL '10 days', 180000.00, 'CUST-PO-005'),
('0000012305', '0000001505', CURRENT_DATE - INTERVAL '7 days', 42500.00, 'CUST-PO-006'),
('0000012306', '0000001506', CURRENT_DATE - INTERVAL '5 days', 157000.00, 'CUST-PO-007'),
('0000012307', '0000001507', CURRENT_DATE - INTERVAL '3 days', 72500.00, 'CUST-PO-008'),
('0000012308', '0000001508', CURRENT_DATE - INTERVAL '2 days', 67500.00, 'CUST-PO-009'),
('0000012309', '0000001509', CURRENT_DATE - INTERVAL '1 day', 185000.00, 'CUST-PO-010')
ON CONFLICT (vbeln) DO NOTHING;

-- Deliveries
INSERT INTO likp (vbeln, kunnr, lfdat, status, tracking_num, carrier) VALUES
('0080000100', '0000001500', CURRENT_DATE - INTERVAL '15 days', 'DELIVERED', 'UPS-123456789', 'UPS'),
('0080000101', '0000001501', CURRENT_DATE - INTERVAL '12 days', 'DELIVERED', 'FDX-987654321', 'FedEx'),
('0080000102', '0000001502', CURRENT_DATE - INTERVAL '8 days', 'DELIVERED', 'DHL-456789123', 'DHL'),
('0080000103', '0000001503', CURRENT_DATE - INTERVAL '5 days', 'IN_TRANSIT', 'FDX-789456123', 'FedEx'),
('0080000104', '0000001504', CURRENT_DATE - INTERVAL '3 days', 'IN_TRANSIT', 'UPS-321654987', 'UPS'),
('0080000105', '0000001505', CURRENT_DATE - INTERVAL '1 day', 'PROCESSING', 'FDX-654321789', 'FedEx'),
('0080000106', '0000001506', CURRENT_DATE, 'PICKING', 'DHL-987123456', 'DHL')
ON CONFLICT (vbeln) DO NOTHING;

-- Invoices
INSERT INTO rbkp (belnr, gjahr, lifnr, xblnr, bldat, budat, rmwwr, rbstat) VALUES
('5100000001', '2024', '0000001000', 'INV-2024-001', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '25 days', 45000.00, 'PAID'),
('5100000002', '2024', '0000001001', 'INV-2024-002', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '20 days', 78500.00, 'PAID'),
('5100000003', '2024', '0000001002', 'INV-2024-003', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', 12500.00, 'PARTIAL'),
('5100000004', '2024', '0000001003', 'INV-2024-004', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', 34000.00, 'OPEN'),
('5100000005', '2024', '0000001004', 'INV-2024-005', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 8500.00, 'OPEN')
ON CONFLICT (belnr) DO NOTHING;
