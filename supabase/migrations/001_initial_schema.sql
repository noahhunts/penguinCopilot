-- SAP Copilot Demo - Supabase Schema
-- This creates all the SAP-like tables for the demo

-- Vendor Master (LFA1)
CREATE TABLE IF NOT EXISTS lfa1 (
    lifnr TEXT PRIMARY KEY,
    name1 TEXT NOT NULL,
    name2 TEXT DEFAULT '',
    stras TEXT DEFAULT '',
    ort01 TEXT DEFAULT '',
    pstlz TEXT DEFAULT '',
    regio TEXT DEFAULT '',
    telf1 TEXT DEFAULT '',
    stcd1 TEXT DEFAULT '',
    erdat DATE DEFAULT CURRENT_DATE,
    loevm TEXT DEFAULT ''
);

-- Customer Master (KNA1)
CREATE TABLE IF NOT EXISTS kna1 (
    kunnr TEXT PRIMARY KEY,
    name1 TEXT NOT NULL,
    name2 TEXT DEFAULT '',
    stras TEXT DEFAULT '',
    ort01 TEXT DEFAULT '',
    pstlz TEXT DEFAULT '',
    regio TEXT DEFAULT '',
    telf1 TEXT DEFAULT '',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    sperr TEXT DEFAULT ''
);

-- Material Master (MARA)
CREATE TABLE IF NOT EXISTS mara (
    matnr TEXT PRIMARY KEY,
    mtart TEXT DEFAULT '',
    matkl TEXT DEFAULT '',
    meins TEXT DEFAULT 'EA',
    brgew DECIMAL(10,3) DEFAULT 0,
    ntgew DECIMAL(10,3) DEFAULT 0,
    volum DECIMAL(10,6) DEFAULT 0,
    ersda DATE DEFAULT CURRENT_DATE,
    laeda DATE DEFAULT CURRENT_DATE,
    lvorm TEXT DEFAULT ''
);

-- Material Description (MAKT)
CREATE TABLE IF NOT EXISTS makt (
    matnr TEXT NOT NULL,
    spras TEXT DEFAULT 'E',
    maktx TEXT NOT NULL,
    PRIMARY KEY (matnr, spras),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Plant Data (MARC)
CREATE TABLE IF NOT EXISTS marc (
    matnr TEXT NOT NULL,
    werks TEXT NOT NULL,
    stdprice DECIMAL(15,2) DEFAULT 0,
    PRIMARY KEY (matnr, werks),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Storage Location Data (MARD)
CREATE TABLE IF NOT EXISTS mard (
    matnr TEXT NOT NULL,
    werks TEXT NOT NULL,
    lgort TEXT NOT NULL,
    labst DECIMAL(15,3) DEFAULT 0,
    PRIMARY KEY (matnr, werks, lgort),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Purchase Order Header (EKKO)
CREATE TABLE IF NOT EXISTS ekko (
    ebeln TEXT PRIMARY KEY,
    lifnr TEXT NOT NULL,
    bedat DATE DEFAULT CURRENT_DATE,
    netwr DECIMAL(15,2) DEFAULT 0,
    waers TEXT DEFAULT 'USD',
    FOREIGN KEY (lifnr) REFERENCES lfa1(lifnr)
);

-- Purchase Order Item (EKPO)
CREATE TABLE IF NOT EXISTS ekpo (
    ebeln TEXT NOT NULL,
    ebelp TEXT NOT NULL,
    matnr TEXT,
    txz01 TEXT DEFAULT '',
    menge DECIMAL(13,3) DEFAULT 0,
    meins TEXT DEFAULT 'EA',
    netpr DECIMAL(13,2) DEFAULT 0,
    PRIMARY KEY (ebeln, ebelp),
    FOREIGN KEY (ebeln) REFERENCES ekko(ebeln),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Sales Order Header (VBAK)
CREATE TABLE IF NOT EXISTS vbak (
    vbeln TEXT PRIMARY KEY,
    kunnr TEXT NOT NULL,
    erdat DATE DEFAULT CURRENT_DATE,
    netwr DECIMAL(15,2) DEFAULT 0,
    waerk TEXT DEFAULT 'USD',
    bstnk TEXT DEFAULT '',
    FOREIGN KEY (kunnr) REFERENCES kna1(kunnr)
);

-- Sales Order Item (VBAP)
CREATE TABLE IF NOT EXISTS vbap (
    vbeln TEXT NOT NULL,
    posnr TEXT NOT NULL,
    matnr TEXT,
    arktx TEXT DEFAULT '',
    kwmeng DECIMAL(13,3) DEFAULT 0,
    vrkme TEXT DEFAULT 'EA',
    netwr DECIMAL(13,2) DEFAULT 0,
    PRIMARY KEY (vbeln, posnr),
    FOREIGN KEY (vbeln) REFERENCES vbak(vbeln),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Delivery Header (LIKP)
CREATE TABLE IF NOT EXISTS likp (
    vbeln TEXT PRIMARY KEY,
    kunnr TEXT NOT NULL,
    lfdat DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'CREATED',
    tracking_num TEXT DEFAULT '',
    carrier TEXT DEFAULT '',
    FOREIGN KEY (kunnr) REFERENCES kna1(kunnr)
);

-- Delivery Item (LIPS)
CREATE TABLE IF NOT EXISTS lips (
    vbeln TEXT NOT NULL,
    posnr TEXT NOT NULL,
    matnr TEXT,
    arktx TEXT DEFAULT '',
    lfimg DECIMAL(13,3) DEFAULT 0,
    vrkme TEXT DEFAULT 'EA',
    PRIMARY KEY (vbeln, posnr),
    FOREIGN KEY (vbeln) REFERENCES likp(vbeln),
    FOREIGN KEY (matnr) REFERENCES mara(matnr)
);

-- Invoice Header (RBKP)
CREATE TABLE IF NOT EXISTS rbkp (
    belnr TEXT PRIMARY KEY,
    gjahr TEXT NOT NULL,
    lifnr TEXT NOT NULL,
    xblnr TEXT DEFAULT '',
    bldat DATE DEFAULT CURRENT_DATE,
    budat DATE DEFAULT CURRENT_DATE,
    rmwwr DECIMAL(13,2) DEFAULT 0,
    waers TEXT DEFAULT 'USD',
    rbstat TEXT DEFAULT 'OPEN',
    FOREIGN KEY (lifnr) REFERENCES lfa1(lifnr)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lfa1_name1 ON lfa1(name1);
CREATE INDEX IF NOT EXISTS idx_kna1_name1 ON kna1(name1);
CREATE INDEX IF NOT EXISTS idx_makt_maktx ON makt(maktx);
CREATE INDEX IF NOT EXISTS idx_ekko_lifnr ON ekko(lifnr);
CREATE INDEX IF NOT EXISTS idx_ekko_bedat ON ekko(bedat);
CREATE INDEX IF NOT EXISTS idx_vbak_kunnr ON vbak(kunnr);
CREATE INDEX IF NOT EXISTS idx_vbak_erdat ON vbak(erdat);
CREATE INDEX IF NOT EXISTS idx_likp_tracking ON likp(tracking_num);
CREATE INDEX IF NOT EXISTS idx_likp_status ON likp(status);
