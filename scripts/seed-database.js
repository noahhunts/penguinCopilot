const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'sap_demo.db'));

console.log('🚀 Initializing SAP Demo Database...\n');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// ============================================================================
// CREATE TABLES - Mirroring SAP ERP Structure
// ============================================================================

console.log('📋 Creating tables...');

// LFA1 - Vendor Master
db.exec(`
  CREATE TABLE IF NOT EXISTS LFA1 (
    MANDT TEXT DEFAULT '100',
    LIFNR TEXT PRIMARY KEY,
    KTOKK TEXT DEFAULT '0001',
    NAME1 TEXT NOT NULL,
    NAME2 TEXT,
    LAND1 TEXT DEFAULT 'US',
    STRAS TEXT,
    ORT01 TEXT,
    PSTLZ TEXT,
    REGIO TEXT,
    TELF1 TEXT,
    TELFX TEXT,
    ERDAT TEXT,
    SPRAS TEXT DEFAULT 'E',
    STCD1 TEXT,
    SPERR TEXT DEFAULT '',
    LOEVM TEXT DEFAULT ''
  )
`);

// KNA1 - Customer Master
db.exec(`
  CREATE TABLE IF NOT EXISTS KNA1 (
    MANDT TEXT DEFAULT '100',
    KUNNR TEXT PRIMARY KEY,
    KTOKD TEXT DEFAULT '0001',
    NAME1 TEXT NOT NULL,
    NAME2 TEXT,
    LAND1 TEXT DEFAULT 'US',
    STRAS TEXT,
    ORT01 TEXT,
    PSTLZ TEXT,
    REGIO TEXT,
    TELF1 TEXT,
    SPRAS TEXT DEFAULT 'E',
    STCD1 TEXT,
    SPERR TEXT DEFAULT '',
    CREDIT_LIMIT REAL DEFAULT 100000.00,
    CREDIT_USED REAL DEFAULT 0.00
  )
`);

// MARA - Material Master
db.exec(`
  CREATE TABLE IF NOT EXISTS MARA (
    MANDT TEXT DEFAULT '100',
    MATNR TEXT PRIMARY KEY,
    MTART TEXT NOT NULL,
    MBRSH TEXT DEFAULT 'M',
    MATKL TEXT,
    MEINS TEXT DEFAULT 'EA',
    BRGEW REAL,
    NTGEW REAL,
    GEWEI TEXT DEFAULT 'KG',
    VOLUM REAL,
    SPART TEXT DEFAULT '00',
    ERSDA TEXT,
    LAEDA TEXT,
    VPSTA TEXT DEFAULT 'KBEVADSWLPQZX',
    LVORM TEXT DEFAULT ''
  )
`);

// MAKT - Material Description
db.exec(`
  CREATE TABLE IF NOT EXISTS MAKT (
    MANDT TEXT DEFAULT '100',
    MATNR TEXT,
    SPRAS TEXT DEFAULT 'E',
    MAKTX TEXT NOT NULL,
    MAKTG TEXT,
    PRIMARY KEY (MATNR, SPRAS),
    FOREIGN KEY (MATNR) REFERENCES MARA(MATNR)
  )
`);

// MARC - Plant Data for Material
db.exec(`
  CREATE TABLE IF NOT EXISTS MARC (
    MANDT TEXT DEFAULT '100',
    MATNR TEXT,
    WERKS TEXT,
    PSTAT TEXT DEFAULT 'KBEVADSWLP',
    DISMM TEXT DEFAULT 'PD',
    DISPO TEXT DEFAULT '001',
    MINBE REAL DEFAULT 0,
    EISBE REAL DEFAULT 0,
    BSTMI REAL DEFAULT 1,
    BSTMA REAL DEFAULT 10000,
    PLIFZ INTEGER DEFAULT 5,
    BESKZ TEXT DEFAULT 'F',
    MMSTA TEXT DEFAULT '',
    LVORM TEXT DEFAULT '',
    STDPRICE REAL DEFAULT 0,
    PRIMARY KEY (MATNR, WERKS),
    FOREIGN KEY (MATNR) REFERENCES MARA(MATNR)
  )
`);

// MARD - Storage Location Stock
db.exec(`
  CREATE TABLE IF NOT EXISTS MARD (
    MANDT TEXT DEFAULT '100',
    MATNR TEXT,
    WERKS TEXT,
    LGORT TEXT,
    LABST REAL DEFAULT 0,
    UMLME REAL DEFAULT 0,
    INSME REAL DEFAULT 0,
    EINME REAL DEFAULT 0,
    SPEME REAL DEFAULT 0,
    RETME REAL DEFAULT 0,
    PSTAT TEXT DEFAULT 'B',
    LVORM TEXT DEFAULT '',
    SPERR TEXT DEFAULT '',
    ERSDA TEXT,
    PRIMARY KEY (MATNR, WERKS, LGORT),
    FOREIGN KEY (MATNR) REFERENCES MARA(MATNR)
  )
`);

// EKKO - Purchase Order Header
db.exec(`
  CREATE TABLE IF NOT EXISTS EKKO (
    MANDT TEXT DEFAULT '100',
    EBELN TEXT PRIMARY KEY,
    BUKRS TEXT DEFAULT '1000',
    BSTYP TEXT DEFAULT 'F',
    BSART TEXT DEFAULT 'NB',
    LIFNR TEXT,
    BEDAT TEXT,
    EKORG TEXT DEFAULT '1000',
    EKGRP TEXT DEFAULT '001',
    WAERS TEXT DEFAULT 'USD',
    ZTERM TEXT DEFAULT 'NT30',
    STATU TEXT DEFAULT '',
    LOEKZ TEXT DEFAULT '',
    AEDAT TEXT,
    ERNAM TEXT,
    NETWR REAL DEFAULT 0,
    FOREIGN KEY (LIFNR) REFERENCES LFA1(LIFNR)
  )
`);

// EKPO - Purchase Order Item
db.exec(`
  CREATE TABLE IF NOT EXISTS EKPO (
    MANDT TEXT DEFAULT '100',
    EBELN TEXT,
    EBELP TEXT,
    MATNR TEXT,
    TXZ01 TEXT,
    MENGE REAL,
    MEINS TEXT DEFAULT 'EA',
    NETPR REAL,
    NETWR REAL,
    WERKS TEXT DEFAULT '1000',
    LGORT TEXT DEFAULT '0001',
    PSTYP TEXT DEFAULT '0',
    LOEKZ TEXT DEFAULT '',
    ELIKZ TEXT DEFAULT '',
    EREKZ TEXT DEFAULT '',
    DELIVERED_QTY REAL DEFAULT 0,
    PRIMARY KEY (EBELN, EBELP),
    FOREIGN KEY (EBELN) REFERENCES EKKO(EBELN),
    FOREIGN KEY (MATNR) REFERENCES MARA(MATNR)
  )
`);

// VBAK - Sales Order Header
db.exec(`
  CREATE TABLE IF NOT EXISTS VBAK (
    MANDT TEXT DEFAULT '100',
    VBELN TEXT PRIMARY KEY,
    ERDAT TEXT,
    AUART TEXT DEFAULT 'OR',
    VBTYP TEXT DEFAULT 'C',
    KUNNR TEXT,
    NETWR REAL DEFAULT 0,
    WAERK TEXT DEFAULT 'USD',
    VKORG TEXT DEFAULT '1000',
    VTWEG TEXT DEFAULT '10',
    SPART TEXT DEFAULT '00',
    AUDAT TEXT,
    BSTNK TEXT,
    LIFSK TEXT DEFAULT '',
    AEDAT TEXT,
    FOREIGN KEY (KUNNR) REFERENCES KNA1(KUNNR)
  )
`);

// VBAP - Sales Order Item
db.exec(`
  CREATE TABLE IF NOT EXISTS VBAP (
    MANDT TEXT DEFAULT '100',
    VBELN TEXT,
    POSNR TEXT,
    MATNR TEXT,
    ARKTX TEXT,
    PSTYV TEXT DEFAULT 'TAN',
    KWMENG REAL,
    VRKME TEXT DEFAULT 'EA',
    MEINS TEXT DEFAULT 'EA',
    NETWR REAL,
    WAERK TEXT DEFAULT 'USD',
    WERKS TEXT DEFAULT '1000',
    LGORT TEXT DEFAULT '0001',
    VSTEL TEXT DEFAULT '1000',
    SPART TEXT DEFAULT '00',
    DELIVERED_QTY REAL DEFAULT 0,
    PRIMARY KEY (VBELN, POSNR),
    FOREIGN KEY (VBELN) REFERENCES VBAK(VBELN),
    FOREIGN KEY (MATNR) REFERENCES MARA(MATNR)
  )
`);

// LIKP - Delivery Header
db.exec(`
  CREATE TABLE IF NOT EXISTS LIKP (
    MANDT TEXT DEFAULT '100',
    VBELN TEXT PRIMARY KEY,
    ERDAT TEXT,
    LFART TEXT DEFAULT 'LF',
    VSTEL TEXT DEFAULT '1000',
    VKORG TEXT DEFAULT '1000',
    LFDAT TEXT,
    KUNNR TEXT,
    KUNAG TEXT,
    BTGEW REAL DEFAULT 0,
    GEWEI TEXT DEFAULT 'KG',
    WADAT TEXT,
    WAERK TEXT DEFAULT 'USD',
    LIFSK TEXT DEFAULT '',
    LGNUM TEXT DEFAULT '001',
    STATUS TEXT DEFAULT 'CREATED',
    TRACKING_NUM TEXT,
    CARRIER TEXT
  )
`);

// LIPS - Delivery Item
db.exec(`
  CREATE TABLE IF NOT EXISTS LIPS (
    MANDT TEXT DEFAULT '100',
    VBELN TEXT,
    POSNR TEXT,
    MATNR TEXT,
    ARKTX TEXT,
    LFIMG REAL,
    VRKME TEXT DEFAULT 'EA',
    MEINS TEXT DEFAULT 'EA',
    WERKS TEXT DEFAULT '1000',
    LGORT TEXT DEFAULT '0001',
    CHARG TEXT,
    BRGEW REAL,
    NTGEW REAL,
    ERDAT TEXT,
    SO_VBELN TEXT,
    SO_POSNR TEXT,
    PRIMARY KEY (VBELN, POSNR),
    FOREIGN KEY (VBELN) REFERENCES LIKP(VBELN)
  )
`);

// RBKP - Invoice Header
db.exec(`
  CREATE TABLE IF NOT EXISTS RBKP (
    MANDT TEXT DEFAULT '100',
    BELNR TEXT,
    GJAHR TEXT,
    BLART TEXT DEFAULT 'RE',
    BLDAT TEXT,
    BUDAT TEXT,
    BUKRS TEXT DEFAULT '1000',
    LIFNR TEXT,
    WAERS TEXT DEFAULT 'USD',
    RMWWR REAL DEFAULT 0,
    XRECH TEXT DEFAULT 'X',
    RBSTAT TEXT DEFAULT '5',
    ZTERM TEXT DEFAULT 'NT30',
    USNAM TEXT,
    XBLNR TEXT,
    PRIMARY KEY (BELNR, GJAHR),
    FOREIGN KEY (LIFNR) REFERENCES LFA1(LIFNR)
  )
`);

// RSEG - Invoice Item
db.exec(`
  CREATE TABLE IF NOT EXISTS RSEG (
    MANDT TEXT DEFAULT '100',
    BELNR TEXT,
    GJAHR TEXT,
    BUZEI TEXT,
    EBELN TEXT,
    EBELP TEXT,
    MATNR TEXT,
    BUKRS TEXT DEFAULT '1000',
    WRBTR REAL,
    SHKZG TEXT DEFAULT 'S',
    MENGE REAL,
    MEINS TEXT DEFAULT 'EA',
    MWSKZ TEXT DEFAULT 'V1',
    PRIMARY KEY (BELNR, GJAHR, BUZEI)
  )
`);

// Transaction Log for demo visualization
db.exec(`
  CREATE TABLE IF NOT EXISTS TRANSACTION_LOG (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    TIMESTAMP TEXT DEFAULT (datetime('now')),
    USER_QUERY TEXT,
    INTENT TEXT,
    CONFIDENCE REAL,
    BAPI_NAME TEXT,
    BAPI_PARAMS TEXT,
    SAP_TABLE TEXT,
    SAP_OPERATION TEXT,
    RESULT_STATUS TEXT,
    RESULT_DATA TEXT,
    EXECUTION_TIME_MS INTEGER,
    SESSION_ID TEXT
  )
`);

console.log('✅ Tables created successfully\n');

// ============================================================================
// SEED DATA - Comprehensive realistic SAP data
// ============================================================================

console.log('🌱 Seeding data...\n');

// --- VENDORS ---
console.log('  → Adding vendors (LFA1)...');
const vendors = [
  { LIFNR: '0000001000', NAME1: 'Acme Industrial Supply', NAME2: 'Inc.', STRAS: '123 Industrial Parkway', ORT01: 'Chicago', PSTLZ: '60601', REGIO: 'IL', TELF1: '+1-312-555-1234', STCD1: '12-3456789' },
  { LIFNR: '0000001001', NAME1: 'Global Manufacturing Corp', NAME2: 'East Division', STRAS: '500 Factory Lane', ORT01: 'Detroit', PSTLZ: '48201', REGIO: 'MI', TELF1: '+1-313-555-5678', STCD1: '23-4567890' },
  { LIFNR: '0000001002', NAME1: 'Pacific Components Ltd', NAME2: '', STRAS: '789 Tech Boulevard', ORT01: 'San Jose', PSTLZ: '95110', REGIO: 'CA', TELF1: '+1-408-555-9012', STCD1: '34-5678901' },
  { LIFNR: '0000001003', NAME1: 'European Motors GmbH', NAME2: 'NA Branch', STRAS: '456 Import Drive', ORT01: 'Newark', PSTLZ: '07102', REGIO: 'NJ', TELF1: '+1-973-555-3456', STCD1: '45-6789012' },
  { LIFNR: '0000001004', NAME1: 'Midwest Steel & Alloys', NAME2: 'LLC', STRAS: '321 Foundry Road', ORT01: 'Cleveland', PSTLZ: '44101', REGIO: 'OH', TELF1: '+1-216-555-7890', STCD1: '56-7890123' },
  { LIFNR: '0000001005', NAME1: 'Southern Electronics Inc', NAME2: '', STRAS: '888 Circuit Way', ORT01: 'Austin', PSTLZ: '78701', REGIO: 'TX', TELF1: '+1-512-555-2345', STCD1: '67-8901234' },
  { LIFNR: '0000001006', NAME1: 'Advanced Plastics Corp', NAME2: '', STRAS: '777 Polymer Street', ORT01: 'Houston', PSTLZ: '77001', REGIO: 'TX', TELF1: '+1-713-555-6789', STCD1: '78-9012345' },
  { LIFNR: '0000001007', NAME1: 'Precision Tools & Dies', NAME2: 'Co.', STRAS: '555 Machining Ave', ORT01: 'Milwaukee', PSTLZ: '53201', REGIO: 'WI', TELF1: '+1-414-555-0123', STCD1: '89-0123456' },
  { LIFNR: '0000001008', NAME1: 'Asian Tech Imports', NAME2: 'LLC', STRAS: '999 Harbor Way', ORT01: 'Los Angeles', PSTLZ: '90001', REGIO: 'CA', TELF1: '+1-213-555-4567', STCD1: '90-1234567' },
  { LIFNR: '0000001009', NAME1: 'Quality Fasteners Inc', NAME2: '', STRAS: '222 Bolt Lane', ORT01: 'Pittsburgh', PSTLZ: '15201', REGIO: 'PA', TELF1: '+1-412-555-8901', STCD1: '01-2345678' },
];

const insertVendor = db.prepare(`
  INSERT OR REPLACE INTO LFA1 (LIFNR, NAME1, NAME2, STRAS, ORT01, PSTLZ, REGIO, TELF1, STCD1, ERDAT)
  VALUES (@LIFNR, @NAME1, @NAME2, @STRAS, @ORT01, @PSTLZ, @REGIO, @TELF1, @STCD1, date('now'))
`);

vendors.forEach(v => insertVendor.run(v));

// --- CUSTOMERS ---
console.log('  → Adding customers (KNA1)...');
const customers = [
  { KUNNR: '0000001500', NAME1: 'TechFlow Industries', NAME2: 'Main Campus', STRAS: '1000 Innovation Way', ORT01: 'Seattle', PSTLZ: '98101', REGIO: 'WA', TELF1: '+1-206-555-1111', CREDIT_LIMIT: 500000 },
  { KUNNR: '0000001501', NAME1: 'AutoParts Unlimited', NAME2: '', STRAS: '2500 Dealer Row', ORT01: 'Dallas', PSTLZ: '75201', REGIO: 'TX', TELF1: '+1-214-555-2222', CREDIT_LIMIT: 750000 },
  { KUNNR: '0000001502', NAME1: 'Mega Construction Co', NAME2: 'Projects Division', STRAS: '3000 Builder Blvd', ORT01: 'Phoenix', PSTLZ: '85001', REGIO: 'AZ', TELF1: '+1-602-555-3333', CREDIT_LIMIT: 1000000 },
  { KUNNR: '0000001503', NAME1: 'SmartHome Systems', NAME2: 'Inc.', STRAS: '4000 Connected Drive', ORT01: 'Denver', PSTLZ: '80201', REGIO: 'CO', TELF1: '+1-303-555-4444', CREDIT_LIMIT: 300000 },
  { KUNNR: '0000001504', NAME1: 'Energy Solutions Corp', NAME2: '', STRAS: '5000 Power Street', ORT01: 'Houston', PSTLZ: '77002', REGIO: 'TX', TELF1: '+1-713-555-5555', CREDIT_LIMIT: 2000000 },
  { KUNNR: '0000001505', NAME1: 'Medical Devices Plus', NAME2: 'LLC', STRAS: '6000 Health Lane', ORT01: 'Boston', PSTLZ: '02101', REGIO: 'MA', TELF1: '+1-617-555-6666', CREDIT_LIMIT: 1500000 },
  { KUNNR: '0000001506', NAME1: 'Aerospace Components Inc', NAME2: '', STRAS: '7000 Flight Path', ORT01: 'Wichita', PSTLZ: '67201', REGIO: 'KS', TELF1: '+1-316-555-7777', CREDIT_LIMIT: 3000000 },
  { KUNNR: '0000001507', NAME1: 'Green Tech Solutions', NAME2: '', STRAS: '8000 Eco Way', ORT01: 'Portland', PSTLZ: '97201', REGIO: 'OR', TELF1: '+1-503-555-8888', CREDIT_LIMIT: 400000 },
  { KUNNR: '0000001508', NAME1: 'Marine Equipment Co', NAME2: '', STRAS: '9000 Harbor View', ORT01: 'Miami', PSTLZ: '33101', REGIO: 'FL', TELF1: '+1-305-555-9999', CREDIT_LIMIT: 600000 },
  { KUNNR: '0000001509', NAME1: 'Rail Transport Systems', NAME2: '', STRAS: '1100 Track Lane', ORT01: 'Chicago', PSTLZ: '60602', REGIO: 'IL', TELF1: '+1-312-555-0000', CREDIT_LIMIT: 800000 },
];

const insertCustomer = db.prepare(`
  INSERT OR REPLACE INTO KNA1 (KUNNR, NAME1, NAME2, STRAS, ORT01, PSTLZ, REGIO, TELF1, CREDIT_LIMIT)
  VALUES (@KUNNR, @NAME1, @NAME2, @STRAS, @ORT01, @PSTLZ, @REGIO, @TELF1, @CREDIT_LIMIT)
`);

customers.forEach(c => insertCustomer.run(c));

// --- MATERIALS ---
console.log('  → Adding materials (MARA, MAKT, MARC, MARD)...');

const materials = [
  // Industrial Motors
  { MATNR: 'MAT-10001', MTART: 'FERT', MATKL: 'MOTORS', MEINS: 'EA', BRGEW: 15.5, NTGEW: 14.2, VOLUM: 0.025, MAKTX: 'Industrial Pump Motor 5HP', STDPRICE: 450.00, STOCK: 250 },
  { MATNR: 'MAT-10002', MTART: 'FERT', MATKL: 'MOTORS', MEINS: 'EA', BRGEW: 22.0, NTGEW: 20.5, VOLUM: 0.035, MAKTX: 'Industrial Pump Motor 10HP', STDPRICE: 785.00, STOCK: 125 },
  { MATNR: 'MAT-10003', MTART: 'FERT', MATKL: 'MOTORS', MEINS: 'EA', BRGEW: 8.5, NTGEW: 7.8, VOLUM: 0.015, MAKTX: 'HVAC Blower Motor 2HP', STDPRICE: 225.00, STOCK: 400 },

  // Bearings
  { MATNR: 'MAT-20001', MTART: 'HALB', MATKL: 'BEARING', MEINS: 'EA', BRGEW: 0.45, NTGEW: 0.42, VOLUM: 0.001, MAKTX: 'Ball Bearing 6205-2RS', STDPRICE: 12.50, STOCK: 5000 },
  { MATNR: 'MAT-20002', MTART: 'HALB', MATKL: 'BEARING', MEINS: 'EA', BRGEW: 0.85, NTGEW: 0.80, VOLUM: 0.002, MAKTX: 'Roller Bearing 22210', STDPRICE: 45.00, STOCK: 2500 },
  { MATNR: 'MAT-20003', MTART: 'HALB', MATKL: 'BEARING', MEINS: 'EA', BRGEW: 1.20, NTGEW: 1.15, VOLUM: 0.003, MAKTX: 'Thrust Bearing 51107', STDPRICE: 28.00, STOCK: 3200 },

  // Electronic Components
  { MATNR: 'MAT-30001', MTART: 'ROH', MATKL: 'ELEC', MEINS: 'EA', BRGEW: 0.05, NTGEW: 0.045, VOLUM: 0.0001, MAKTX: 'Power Control Module PCM-500', STDPRICE: 125.00, STOCK: 800 },
  { MATNR: 'MAT-30002', MTART: 'ROH', MATKL: 'ELEC', MEINS: 'EA', BRGEW: 0.12, NTGEW: 0.11, VOLUM: 0.0002, MAKTX: 'Frequency Drive VFD-2000', STDPRICE: 350.00, STOCK: 450 },
  { MATNR: 'MAT-30003', MTART: 'ROH', MATKL: 'ELEC', MEINS: 'EA', BRGEW: 0.02, NTGEW: 0.018, VOLUM: 0.00005, MAKTX: 'Temperature Sensor PT100', STDPRICE: 18.50, STOCK: 12000 },

  // Steel Components
  { MATNR: 'MAT-40001', MTART: 'ROH', MATKL: 'STEEL', MEINS: 'KG', BRGEW: 1.0, NTGEW: 1.0, VOLUM: 0.00013, MAKTX: 'Steel Rod 25mm Diameter', STDPRICE: 2.85, STOCK: 25000 },
  { MATNR: 'MAT-40002', MTART: 'ROH', MATKL: 'STEEL', MEINS: 'KG', BRGEW: 1.0, NTGEW: 1.0, VOLUM: 0.00025, MAKTX: 'Steel Plate 10mm Thick', STDPRICE: 3.25, STOCK: 18000 },
  { MATNR: 'MAT-40003', MTART: 'ROH', MATKL: 'STEEL', MEINS: 'EA', BRGEW: 5.5, NTGEW: 5.5, VOLUM: 0.002, MAKTX: 'Steel Flange DN100', STDPRICE: 42.00, STOCK: 1500 },

  // Pumps
  { MATNR: 'MAT-50001', MTART: 'FERT', MATKL: 'PUMPS', MEINS: 'EA', BRGEW: 35.0, NTGEW: 32.0, VOLUM: 0.05, MAKTX: 'Centrifugal Pump CP-200', STDPRICE: 1250.00, STOCK: 75 },
  { MATNR: 'MAT-50002', MTART: 'FERT', MATKL: 'PUMPS', MEINS: 'EA', BRGEW: 28.0, NTGEW: 25.5, VOLUM: 0.04, MAKTX: 'Gear Pump GP-150', STDPRICE: 890.00, STOCK: 120 },
  { MATNR: 'MAT-50003', MTART: 'FERT', MATKL: 'PUMPS', MEINS: 'EA', BRGEW: 18.0, NTGEW: 16.5, VOLUM: 0.03, MAKTX: 'Diaphragm Pump DP-100', STDPRICE: 675.00, STOCK: 95 },

  // Valves
  { MATNR: 'MAT-60001', MTART: 'FERT', MATKL: 'VALVES', MEINS: 'EA', BRGEW: 4.5, NTGEW: 4.2, VOLUM: 0.008, MAKTX: 'Gate Valve 2" 150LB', STDPRICE: 185.00, STOCK: 350 },
  { MATNR: 'MAT-60002', MTART: 'FERT', MATKL: 'VALVES', MEINS: 'EA', BRGEW: 2.8, NTGEW: 2.5, VOLUM: 0.005, MAKTX: 'Ball Valve 1.5" SS316', STDPRICE: 145.00, STOCK: 500 },
  { MATNR: 'MAT-60003', MTART: 'FERT', MATKL: 'VALVES', MEINS: 'EA', BRGEW: 6.2, NTGEW: 5.8, VOLUM: 0.01, MAKTX: 'Control Valve CV-3000', STDPRICE: 425.00, STOCK: 180 },

  // Fasteners
  { MATNR: 'MAT-70001', MTART: 'ROH', MATKL: 'FASTEN', MEINS: 'EA', BRGEW: 0.025, NTGEW: 0.025, VOLUM: 0.000005, MAKTX: 'Hex Bolt M10x50 GR8.8', STDPRICE: 0.45, STOCK: 50000 },
  { MATNR: 'MAT-70002', MTART: 'ROH', MATKL: 'FASTEN', MEINS: 'EA', BRGEW: 0.008, NTGEW: 0.008, VOLUM: 0.000002, MAKTX: 'Hex Nut M10 GR8', STDPRICE: 0.15, STOCK: 75000 },
  { MATNR: 'MAT-70003', MTART: 'ROH', MATKL: 'FASTEN', MEINS: 'EA', BRGEW: 0.003, NTGEW: 0.003, VOLUM: 0.000001, MAKTX: 'Lock Washer M10 SS', STDPRICE: 0.08, STOCK: 100000 },

  // Hydraulic Components
  { MATNR: 'MAT-80001', MTART: 'FERT', MATKL: 'HYDRA', MEINS: 'EA', BRGEW: 12.0, NTGEW: 11.2, VOLUM: 0.015, MAKTX: 'Hydraulic Cylinder HC-50', STDPRICE: 580.00, STOCK: 85 },
  { MATNR: 'MAT-80002', MTART: 'FERT', MATKL: 'HYDRA', MEINS: 'EA', BRGEW: 8.5, NTGEW: 8.0, VOLUM: 0.012, MAKTX: 'Hydraulic Pump HP-25', STDPRICE: 725.00, STOCK: 65 },
  { MATNR: 'MAT-80003', MTART: 'ROH', MATKL: 'HYDRA', MEINS: 'M', BRGEW: 0.8, NTGEW: 0.75, VOLUM: 0.0003, MAKTX: 'High Pressure Hose 1/2"', STDPRICE: 15.00, STOCK: 2500 },

  // Seals and Gaskets
  { MATNR: 'MAT-90001', MTART: 'ROH', MATKL: 'SEALS', MEINS: 'EA', BRGEW: 0.02, NTGEW: 0.02, VOLUM: 0.00001, MAKTX: 'O-Ring Viton 25mm', STDPRICE: 2.50, STOCK: 25000 },
  { MATNR: 'MAT-90002', MTART: 'ROH', MATKL: 'SEALS', MEINS: 'EA', BRGEW: 0.15, NTGEW: 0.15, VOLUM: 0.0001, MAKTX: 'Spiral Wound Gasket DN50', STDPRICE: 18.00, STOCK: 3500 },
  { MATNR: 'MAT-90003', MTART: 'ROH', MATKL: 'SEALS', MEINS: 'EA', BRGEW: 0.05, NTGEW: 0.05, VOLUM: 0.00002, MAKTX: 'Mechanical Seal MS-20', STDPRICE: 85.00, STOCK: 800 },
];

const insertMara = db.prepare(`
  INSERT OR REPLACE INTO MARA (MATNR, MTART, MATKL, MEINS, BRGEW, NTGEW, VOLUM, ERSDA, LAEDA)
  VALUES (@MATNR, @MTART, @MATKL, @MEINS, @BRGEW, @NTGEW, @VOLUM, date('now', '-180 days'), date('now'))
`);

const insertMakt = db.prepare(`
  INSERT OR REPLACE INTO MAKT (MATNR, SPRAS, MAKTX, MAKTG)
  VALUES (@MATNR, 'E', @MAKTX, UPPER(@MAKTX))
`);

const insertMarc = db.prepare(`
  INSERT OR REPLACE INTO MARC (MATNR, WERKS, MINBE, EISBE, PLIFZ, STDPRICE)
  VALUES (@MATNR, '1000', @MINBE, @EISBE, @PLIFZ, @STDPRICE)
`);

const insertMard = db.prepare(`
  INSERT OR REPLACE INTO MARD (MATNR, WERKS, LGORT, LABST, ERSDA)
  VALUES (@MATNR, '1000', '0001', @LABST, date('now'))
`);

materials.forEach(m => {
  insertMara.run(m);
  insertMakt.run(m);
  insertMarc.run({ MATNR: m.MATNR, MINBE: Math.floor(m.STOCK * 0.1), EISBE: Math.floor(m.STOCK * 0.05), PLIFZ: 5, STDPRICE: m.STDPRICE });
  insertMard.run({ MATNR: m.MATNR, LABST: m.STOCK });
});

// --- PURCHASE ORDERS ---
console.log('  → Adding purchase orders (EKKO, EKPO)...');

const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '');

const purchaseOrders = [
  { EBELN: '4500000100', LIFNR: '0000001000', BEDAT: formatDate(new Date(today - 30*24*60*60*1000)), NETWR: 45000.00, ERNAM: 'JSMITH', items: [
    { EBELP: '00010', MATNR: 'MAT-10001', TXZ01: 'Industrial Pump Motor 5HP', MENGE: 100, NETPR: 450.00 }
  ]},
  { EBELN: '4500000101', LIFNR: '0000001001', BEDAT: formatDate(new Date(today - 25*24*60*60*1000)), NETWR: 78500.00, ERNAM: 'MJOHNSON', items: [
    { EBELP: '00010', MATNR: 'MAT-10002', TXZ01: 'Industrial Pump Motor 10HP', MENGE: 100, NETPR: 785.00 }
  ]},
  { EBELN: '4500000102', LIFNR: '0000001002', BEDAT: formatDate(new Date(today - 20*24*60*60*1000)), NETWR: 62500.00, ERNAM: 'JSMITH', items: [
    { EBELP: '00010', MATNR: 'MAT-20001', TXZ01: 'Ball Bearing 6205-2RS', MENGE: 5000, NETPR: 12.50 }
  ]},
  { EBELN: '4500000103', LIFNR: '0000001003', BEDAT: formatDate(new Date(today - 15*24*60*60*1000)), NETWR: 125000.00, ERNAM: 'AGARCIA', items: [
    { EBELP: '00010', MATNR: 'MAT-50001', TXZ01: 'Centrifugal Pump CP-200', MENGE: 100, NETPR: 1250.00 }
  ]},
  { EBELN: '4500000104', LIFNR: '0000001004', BEDAT: formatDate(new Date(today - 10*24*60*60*1000)), NETWR: 71250.00, ERNAM: 'BWILLIAMS', items: [
    { EBELP: '00010', MATNR: 'MAT-40001', TXZ01: 'Steel Rod 25mm Diameter', MENGE: 25000, NETPR: 2.85 }
  ]},
  { EBELN: '4500000105', LIFNR: '0000001005', BEDAT: formatDate(new Date(today - 7*24*60*60*1000)), NETWR: 35000.00, ERNAM: 'JSMITH', items: [
    { EBELP: '00010', MATNR: 'MAT-30002', TXZ01: 'Frequency Drive VFD-2000', MENGE: 100, NETPR: 350.00 }
  ]},
  { EBELN: '4500000106', LIFNR: '0000001006', BEDAT: formatDate(new Date(today - 5*24*60*60*1000)), NETWR: 9250.00, ERNAM: 'MJOHNSON', items: [
    { EBELP: '00010', MATNR: 'MAT-60001', TXZ01: 'Gate Valve 2" 150LB', MENGE: 50, NETPR: 185.00 }
  ]},
  { EBELN: '4500000107', LIFNR: '0000001007', BEDAT: formatDate(new Date(today - 3*24*60*60*1000)), NETWR: 29000.00, ERNAM: 'AGARCIA', items: [
    { EBELP: '00010', MATNR: 'MAT-80001', TXZ01: 'Hydraulic Cylinder HC-50', MENGE: 50, NETPR: 580.00 }
  ]},
  { EBELN: '4500000108', LIFNR: '0000001008', BEDAT: formatDate(new Date(today - 2*24*60*60*1000)), NETWR: 11000.00, ERNAM: 'BWILLIAMS', items: [
    { EBELP: '00010', MATNR: 'MAT-10003', TXZ01: 'HVAC Blower Motor 2HP', MENGE: 50, NETPR: 225.00 },
    { EBELP: '00020', MATNR: 'MAT-30003', TXZ01: 'Temperature Sensor PT100', MENGE: 50, NETPR: 18.50 }
  ]},
  { EBELN: '4500000109', LIFNR: '0000001009', BEDAT: formatDate(new Date(today - 1*24*60*60*1000)), NETWR: 22500.00, ERNAM: 'JSMITH', items: [
    { EBELP: '00010', MATNR: 'MAT-70001', TXZ01: 'Hex Bolt M10x50 GR8.8', MENGE: 50000, NETPR: 0.45 }
  ]},
];

const insertEkko = db.prepare(`
  INSERT OR REPLACE INTO EKKO (EBELN, LIFNR, BEDAT, NETWR, ERNAM, AEDAT)
  VALUES (@EBELN, @LIFNR, @BEDAT, @NETWR, @ERNAM, @BEDAT)
`);

const insertEkpo = db.prepare(`
  INSERT OR REPLACE INTO EKPO (EBELN, EBELP, MATNR, TXZ01, MENGE, NETPR, NETWR)
  VALUES (@EBELN, @EBELP, @MATNR, @TXZ01, @MENGE, @NETPR, @MENGE * @NETPR)
`);

purchaseOrders.forEach(po => {
  insertEkko.run({ EBELN: po.EBELN, LIFNR: po.LIFNR, BEDAT: po.BEDAT, NETWR: po.NETWR, ERNAM: po.ERNAM });
  po.items.forEach(item => {
    insertEkpo.run({ EBELN: po.EBELN, ...item });
  });
});

// --- SALES ORDERS ---
console.log('  → Adding sales orders (VBAK, VBAP)...');

const salesOrders = [
  { VBELN: '0000012300', KUNNR: '0000001500', ERDAT: formatDate(new Date(today - 28*24*60*60*1000)), NETWR: 67500.00, BSTNK: 'CUST-PO-2024-001', items: [
    { POSNR: '000010', MATNR: 'MAT-10001', ARKTX: 'Industrial Pump Motor 5HP', KWMENG: 150, NETWR: 67500.00 }
  ]},
  { VBELN: '0000012301', KUNNR: '0000001501', ERDAT: formatDate(new Date(today - 22*24*60*60*1000)), NETWR: 125000.00, BSTNK: 'AUTO-REQ-5521', items: [
    { POSNR: '000010', MATNR: 'MAT-50001', ARKTX: 'Centrifugal Pump CP-200', KWMENG: 100, NETWR: 125000.00 }
  ]},
  { VBELN: '0000012302', KUNNR: '0000001502', ERDAT: formatDate(new Date(today - 18*24*60*60*1000)), NETWR: 89000.00, BSTNK: 'MEGA-CONST-887', items: [
    { POSNR: '000010', MATNR: 'MAT-50002', ARKTX: 'Gear Pump GP-150', KWMENG: 100, NETWR: 89000.00 }
  ]},
  { VBELN: '0000012303', KUNNR: '0000001503', ERDAT: formatDate(new Date(today - 14*24*60*60*1000)), NETWR: 35000.00, BSTNK: 'SMART-2024-112', items: [
    { POSNR: '000010', MATNR: 'MAT-30002', ARKTX: 'Frequency Drive VFD-2000', KWMENG: 100, NETWR: 35000.00 }
  ]},
  { VBELN: '0000012304', KUNNR: '0000001504', ERDAT: formatDate(new Date(today - 10*24*60*60*1000)), NETWR: 246500.00, BSTNK: 'ENERGY-SOL-998', items: [
    { POSNR: '000010', MATNR: 'MAT-50001', ARKTX: 'Centrifugal Pump CP-200', KWMENG: 150, NETWR: 187500.00 },
    { POSNR: '000020', MATNR: 'MAT-80001', ARKTX: 'Hydraulic Cylinder HC-50', KWMENG: 100, NETWR: 58000.00 }
  ]},
  { VBELN: '0000012305', KUNNR: '0000001505', ERDAT: formatDate(new Date(today - 6*24*60*60*1000)), NETWR: 42500.00, BSTNK: 'MED-DEV-7745', items: [
    { POSNR: '000010', MATNR: 'MAT-60003', ARKTX: 'Control Valve CV-3000', KWMENG: 100, NETWR: 42500.00 }
  ]},
  { VBELN: '0000012306', KUNNR: '0000001506', ERDAT: formatDate(new Date(today - 4*24*60*60*1000)), NETWR: 157000.00, BSTNK: 'AERO-COMP-2024', items: [
    { POSNR: '000010', MATNR: 'MAT-10002', ARKTX: 'Industrial Pump Motor 10HP', KWMENG: 200, NETWR: 157000.00 }
  ]},
  { VBELN: '0000012307', KUNNR: '0000001507', ERDAT: formatDate(new Date(today - 2*24*60*60*1000)), NETWR: 72500.00, BSTNK: 'GREEN-TECH-445', items: [
    { POSNR: '000010', MATNR: 'MAT-80002', ARKTX: 'Hydraulic Pump HP-25', KWMENG: 100, NETWR: 72500.00 }
  ]},
  { VBELN: '0000012308', KUNNR: '0000001508', ERDAT: formatDate(new Date(today - 1*24*60*60*1000)), NETWR: 67500.00, BSTNK: 'MARINE-EQ-8812', items: [
    { POSNR: '000010', MATNR: 'MAT-50003', ARKTX: 'Diaphragm Pump DP-100', KWMENG: 100, NETWR: 67500.00 }
  ]},
  { VBELN: '0000012309', KUNNR: '0000001509', ERDAT: formatDate(today), NETWR: 185000.00, BSTNK: 'RAIL-TRANS-001', items: [
    { POSNR: '000010', MATNR: 'MAT-60001', ARKTX: 'Gate Valve 2" 150LB', KWMENG: 500, NETWR: 92500.00 },
    { POSNR: '000020', MATNR: 'MAT-60002', ARKTX: 'Ball Valve 1.5" SS316', KWMENG: 500, NETWR: 72500.00 },
    { POSNR: '000030', MATNR: 'MAT-90002', ARKTX: 'Spiral Wound Gasket DN50', KWMENG: 1000, NETWR: 18000.00 }
  ]},
];

const insertVbak = db.prepare(`
  INSERT OR REPLACE INTO VBAK (VBELN, KUNNR, ERDAT, AUDAT, NETWR, BSTNK, AEDAT)
  VALUES (@VBELN, @KUNNR, @ERDAT, @ERDAT, @NETWR, @BSTNK, @ERDAT)
`);

const insertVbap = db.prepare(`
  INSERT OR REPLACE INTO VBAP (VBELN, POSNR, MATNR, ARKTX, KWMENG, NETWR)
  VALUES (@VBELN, @POSNR, @MATNR, @ARKTX, @KWMENG, @NETWR)
`);

salesOrders.forEach(so => {
  insertVbak.run({ VBELN: so.VBELN, KUNNR: so.KUNNR, ERDAT: so.ERDAT, NETWR: so.NETWR, BSTNK: so.BSTNK });
  so.items.forEach(item => {
    insertVbap.run({ VBELN: so.VBELN, ...item });
  });
});

// --- DELIVERIES ---
console.log('  → Adding deliveries (LIKP, LIPS)...');

const deliveries = [
  { VBELN: '0080000100', KUNNR: '0000001500', LFDAT: formatDate(new Date(today - 20*24*60*60*1000)), STATUS: 'DELIVERED', TRACKING_NUM: 'FDX-789456123', CARRIER: 'FedEx', SO_VBELN: '0000012300', items: [
    { POSNR: '000010', MATNR: 'MAT-10001', ARKTX: 'Industrial Pump Motor 5HP', LFIMG: 100 }
  ]},
  { VBELN: '0080000101', KUNNR: '0000001501', LFDAT: formatDate(new Date(today - 15*24*60*60*1000)), STATUS: 'DELIVERED', TRACKING_NUM: 'UPS-123789456', CARRIER: 'UPS', SO_VBELN: '0000012301', items: [
    { POSNR: '000010', MATNR: 'MAT-50001', ARKTX: 'Centrifugal Pump CP-200', LFIMG: 75 }
  ]},
  { VBELN: '0080000102', KUNNR: '0000001502', LFDAT: formatDate(new Date(today - 10*24*60*60*1000)), STATUS: 'DELIVERED', TRACKING_NUM: 'DHL-456123789', CARRIER: 'DHL', SO_VBELN: '0000012302', items: [
    { POSNR: '000010', MATNR: 'MAT-50002', ARKTX: 'Gear Pump GP-150', LFIMG: 100 }
  ]},
  { VBELN: '0080000103', KUNNR: '0000001503', LFDAT: formatDate(new Date(today - 5*24*60*60*1000)), STATUS: 'IN_TRANSIT', TRACKING_NUM: 'FDX-321654987', CARRIER: 'FedEx', SO_VBELN: '0000012303', items: [
    { POSNR: '000010', MATNR: 'MAT-30002', ARKTX: 'Frequency Drive VFD-2000', LFIMG: 100 }
  ]},
  { VBELN: '0080000104', KUNNR: '0000001504', LFDAT: formatDate(new Date(today - 3*24*60*60*1000)), STATUS: 'IN_TRANSIT', TRACKING_NUM: 'UPS-987321654', CARRIER: 'UPS', SO_VBELN: '0000012304', items: [
    { POSNR: '000010', MATNR: 'MAT-50001', ARKTX: 'Centrifugal Pump CP-200', LFIMG: 100 },
    { POSNR: '000020', MATNR: 'MAT-80001', ARKTX: 'Hydraulic Cylinder HC-50', LFIMG: 75 }
  ]},
  { VBELN: '0080000105', KUNNR: '0000001505', LFDAT: formatDate(new Date(today - 1*24*60*60*1000)), STATUS: 'PROCESSING', TRACKING_NUM: '', CARRIER: 'FedEx', SO_VBELN: '0000012305', items: [
    { POSNR: '000010', MATNR: 'MAT-60003', ARKTX: 'Control Valve CV-3000', LFIMG: 100 }
  ]},
  { VBELN: '0080000106', KUNNR: '0000001506', LFDAT: formatDate(today), STATUS: 'PICKING', TRACKING_NUM: '', CARRIER: 'DHL', SO_VBELN: '0000012306', items: [
    { POSNR: '000010', MATNR: 'MAT-10002', ARKTX: 'Industrial Pump Motor 10HP', LFIMG: 150 }
  ]},
];

const insertLikp = db.prepare(`
  INSERT OR REPLACE INTO LIKP (VBELN, KUNNR, KUNAG, LFDAT, STATUS, TRACKING_NUM, CARRIER, ERDAT, WADAT)
  VALUES (@VBELN, @KUNNR, @KUNNR, @LFDAT, @STATUS, @TRACKING_NUM, @CARRIER, @LFDAT, @LFDAT)
`);

const insertLips = db.prepare(`
  INSERT OR REPLACE INTO LIPS (VBELN, POSNR, MATNR, ARKTX, LFIMG, SO_VBELN, ERDAT)
  VALUES (@VBELN, @POSNR, @MATNR, @ARKTX, @LFIMG, @SO_VBELN, date('now'))
`);

deliveries.forEach(del => {
  insertLikp.run({ VBELN: del.VBELN, KUNNR: del.KUNNR, LFDAT: del.LFDAT, STATUS: del.STATUS, TRACKING_NUM: del.TRACKING_NUM, CARRIER: del.CARRIER });
  del.items.forEach(item => {
    insertLips.run({ VBELN: del.VBELN, SO_VBELN: del.SO_VBELN, ...item });
  });
});

// --- INVOICES ---
console.log('  → Adding invoices (RBKP, RSEG)...');

const invoices = [
  { BELNR: '5105000001', GJAHR: '2024', LIFNR: '0000001000', BLDAT: formatDate(new Date(today - 25*24*60*60*1000)), RMWWR: 45000.00, RBSTAT: '5', XBLNR: 'INV-ACME-2024-001', EBELN: '4500000100', items: [
    { BUZEI: '000001', MATNR: 'MAT-10001', MENGE: 100, WRBTR: 45000.00 }
  ]},
  { BELNR: '5105000002', GJAHR: '2024', LIFNR: '0000001001', BLDAT: formatDate(new Date(today - 20*24*60*60*1000)), RMWWR: 78500.00, RBSTAT: '5', XBLNR: 'INV-GMC-2024-015', EBELN: '4500000101', items: [
    { BUZEI: '000001', MATNR: 'MAT-10002', MENGE: 100, WRBTR: 78500.00 }
  ]},
  { BELNR: '5105000003', GJAHR: '2024', LIFNR: '0000001002', BLDAT: formatDate(new Date(today - 15*24*60*60*1000)), RMWWR: 62500.00, RBSTAT: '4', XBLNR: 'INV-PAC-2024-088', EBELN: '4500000102', items: [
    { BUZEI: '000001', MATNR: 'MAT-20001', MENGE: 5000, WRBTR: 62500.00 }
  ]},
  { BELNR: '5105000004', GJAHR: '2024', LIFNR: '0000001003', BLDAT: formatDate(new Date(today - 10*24*60*60*1000)), RMWWR: 125000.00, RBSTAT: '3', XBLNR: 'INV-EUR-2024-442', EBELN: '4500000103', items: [
    { BUZEI: '000001', MATNR: 'MAT-50001', MENGE: 100, WRBTR: 125000.00 }
  ]},
  { BELNR: '5105000005', GJAHR: '2024', LIFNR: '0000001004', BLDAT: formatDate(new Date(today - 5*24*60*60*1000)), RMWWR: 71250.00, RBSTAT: '2', XBLNR: 'INV-MWS-2024-221', EBELN: '4500000104', items: [
    { BUZEI: '000001', MATNR: 'MAT-40001', MENGE: 25000, WRBTR: 71250.00 }
  ]},
];

const insertRbkp = db.prepare(`
  INSERT OR REPLACE INTO RBKP (BELNR, GJAHR, LIFNR, BLDAT, BUDAT, RMWWR, RBSTAT, XBLNR, USNAM)
  VALUES (@BELNR, @GJAHR, @LIFNR, @BLDAT, @BLDAT, @RMWWR, @RBSTAT, @XBLNR, 'SYSTEM')
`);

const insertRseg = db.prepare(`
  INSERT OR REPLACE INTO RSEG (BELNR, GJAHR, BUZEI, EBELN, EBELP, MATNR, MENGE, WRBTR)
  VALUES (@BELNR, @GJAHR, @BUZEI, @EBELN, '00010', @MATNR, @MENGE, @WRBTR)
`);

invoices.forEach(inv => {
  insertRbkp.run({ BELNR: inv.BELNR, GJAHR: inv.GJAHR, LIFNR: inv.LIFNR, BLDAT: inv.BLDAT, RMWWR: inv.RMWWR, RBSTAT: inv.RBSTAT, XBLNR: inv.XBLNR });
  inv.items.forEach(item => {
    insertRseg.run({ BELNR: inv.BELNR, GJAHR: inv.GJAHR, EBELN: inv.EBELN, ...item });
  });
});

// Update customer credit used
const updateCreditUsed = db.prepare(`
  UPDATE KNA1 SET CREDIT_USED = (
    SELECT COALESCE(SUM(NETWR), 0) FROM VBAK WHERE VBAK.KUNNR = KNA1.KUNNR
  )
`);
updateCreditUsed.run();

console.log('\n✅ Database seeded successfully!');

// Print summary
console.log('\n📊 Data Summary:');
console.log(`   Vendors:          ${db.prepare('SELECT COUNT(*) as c FROM LFA1').get().c}`);
console.log(`   Customers:        ${db.prepare('SELECT COUNT(*) as c FROM KNA1').get().c}`);
console.log(`   Materials:        ${db.prepare('SELECT COUNT(*) as c FROM MARA').get().c}`);
console.log(`   Purchase Orders:  ${db.prepare('SELECT COUNT(*) as c FROM EKKO').get().c}`);
console.log(`   PO Line Items:    ${db.prepare('SELECT COUNT(*) as c FROM EKPO').get().c}`);
console.log(`   Sales Orders:     ${db.prepare('SELECT COUNT(*) as c FROM VBAK').get().c}`);
console.log(`   SO Line Items:    ${db.prepare('SELECT COUNT(*) as c FROM VBAP').get().c}`);
console.log(`   Deliveries:       ${db.prepare('SELECT COUNT(*) as c FROM LIKP').get().c}`);
console.log(`   Invoices:         ${db.prepare('SELECT COUNT(*) as c FROM RBKP').get().c}`);

db.close();
console.log('\n🎉 Database initialization complete!\n');
