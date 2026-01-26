import Database from 'better-sqlite3';
import path from 'path';

// Singleton database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'sap_demo.db');
    db = new Database(dbPath, { readonly: false });
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// ============================================================================
// VENDOR OPERATIONS (LFA1)
// ============================================================================

export interface Vendor {
  LIFNR: string;
  NAME1: string;
  NAME2?: string;
  STRAS?: string;
  ORT01?: string;
  PSTLZ?: string;
  REGIO?: string;
  TELF1?: string;
  LAND1?: string;
}

export function getVendors(): Vendor[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM LFA1 ORDER BY NAME1').all() as Vendor[];
}

export function getVendorById(lifnr: string): Vendor | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM LFA1 WHERE LIFNR = ?').get(lifnr) as Vendor | undefined;
}

export function searchVendors(query: string): Vendor[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM LFA1
    WHERE NAME1 LIKE ? OR NAME2 LIKE ? OR LIFNR LIKE ?
    ORDER BY NAME1
  `).all(`%${query}%`, `%${query}%`, `%${query}%`) as Vendor[];
}

// ============================================================================
// CUSTOMER OPERATIONS (KNA1)
// ============================================================================

export interface Customer {
  KUNNR: string;
  NAME1: string;
  NAME2?: string;
  STRAS?: string;
  ORT01?: string;
  PSTLZ?: string;
  REGIO?: string;
  TELF1?: string;
  CREDIT_LIMIT?: number;
  CREDIT_USED?: number;
}

export function getCustomers(): Customer[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM KNA1 ORDER BY NAME1').all() as Customer[];
}

export function getCustomerById(kunnr: string): Customer | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM KNA1 WHERE KUNNR = ?').get(kunnr) as Customer | undefined;
}

export function searchCustomers(query: string): Customer[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM KNA1
    WHERE NAME1 LIKE ? OR NAME2 LIKE ? OR KUNNR LIKE ?
    ORDER BY NAME1
  `).all(`%${query}%`, `%${query}%`, `%${query}%`) as Customer[];
}

// ============================================================================
// MATERIAL OPERATIONS (MARA, MAKT, MARC, MARD)
// ============================================================================

export interface Material {
  MATNR: string;
  MAKTX: string;
  MTART: string;
  MATKL?: string;
  MEINS: string;
  BRGEW?: number;
  NTGEW?: number;
  STDPRICE?: number;
  LABST?: number; // Available stock
  WERKS?: string;
  LGORT?: string;
}

export function getMaterials(): Material[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT m.*, t.MAKTX, c.STDPRICE, d.LABST, d.WERKS, d.LGORT
    FROM MARA m
    LEFT JOIN MAKT t ON m.MATNR = t.MATNR AND t.SPRAS = 'E'
    LEFT JOIN MARC c ON m.MATNR = c.MATNR AND c.WERKS = '1000'
    LEFT JOIN MARD d ON m.MATNR = d.MATNR AND d.WERKS = '1000' AND d.LGORT = '0001'
    ORDER BY t.MAKTX
  `).all() as Material[];
}

export function getMaterialById(matnr: string): Material | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT m.*, t.MAKTX, c.STDPRICE, d.LABST, d.WERKS, d.LGORT
    FROM MARA m
    LEFT JOIN MAKT t ON m.MATNR = t.MATNR AND t.SPRAS = 'E'
    LEFT JOIN MARC c ON m.MATNR = c.MATNR AND c.WERKS = '1000'
    LEFT JOIN MARD d ON m.MATNR = d.MATNR AND d.WERKS = '1000' AND d.LGORT = '0001'
    WHERE m.MATNR = ?
  `).get(matnr) as Material | undefined;
}

export function searchMaterials(query: string): Material[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT m.*, t.MAKTX, c.STDPRICE, d.LABST, d.WERKS, d.LGORT
    FROM MARA m
    LEFT JOIN MAKT t ON m.MATNR = t.MATNR AND t.SPRAS = 'E'
    LEFT JOIN MARC c ON m.MATNR = c.MATNR AND c.WERKS = '1000'
    LEFT JOIN MARD d ON m.MATNR = d.MATNR AND d.WERKS = '1000' AND d.LGORT = '0001'
    WHERE t.MAKTX LIKE ? OR m.MATNR LIKE ? OR m.MATKL LIKE ?
    ORDER BY t.MAKTX
  `).all(`%${query}%`, `%${query}%`, `%${query}%`) as Material[];
}

export function checkMaterialAvailability(matnr: string, quantity: number): { available: boolean; stock: number; } {
  const db = getDatabase();
  const result = db.prepare(`
    SELECT COALESCE(SUM(LABST), 0) as stock
    FROM MARD WHERE MATNR = ?
  `).get(matnr) as { stock: number };

  return {
    available: result.stock >= quantity,
    stock: result.stock
  };
}

// ============================================================================
// PURCHASE ORDER OPERATIONS (EKKO, EKPO)
// ============================================================================

export interface PurchaseOrderHeader {
  EBELN: string;
  LIFNR: string;
  VENDOR_NAME?: string;
  BEDAT: string;
  NETWR: number;
  WAERS: string;
  BSART: string;
  ERNAM?: string;
  STATU?: string;
}

export interface PurchaseOrderItem {
  EBELN: string;
  EBELP: string;
  MATNR: string;
  TXZ01: string;
  MENGE: number;
  MEINS: string;
  NETPR: number;
  NETWR: number;
  DELIVERED_QTY?: number;
}

export interface PurchaseOrder extends PurchaseOrderHeader {
  items: PurchaseOrderItem[];
}

export function getPurchaseOrders(): PurchaseOrderHeader[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT e.*, v.NAME1 as VENDOR_NAME
    FROM EKKO e
    LEFT JOIN LFA1 v ON e.LIFNR = v.LIFNR
    ORDER BY e.BEDAT DESC
  `).all() as PurchaseOrderHeader[];
}

export function getPurchaseOrderById(ebeln: string): PurchaseOrder | undefined {
  const db = getDatabase();
  const header = db.prepare(`
    SELECT e.*, v.NAME1 as VENDOR_NAME
    FROM EKKO e
    LEFT JOIN LFA1 v ON e.LIFNR = v.LIFNR
    WHERE e.EBELN = ?
  `).get(ebeln) as PurchaseOrderHeader | undefined;

  if (!header) return undefined;

  const items = db.prepare(`
    SELECT * FROM EKPO WHERE EBELN = ? ORDER BY EBELP
  `).all(ebeln) as PurchaseOrderItem[];

  return { ...header, items };
}

export function createPurchaseOrder(
  lifnr: string,
  items: Array<{ matnr: string; quantity: number; price: number; description: string }>
): { success: boolean; ebeln?: string; error?: string } {
  const db = getDatabase();

  try {
    // Generate new PO number
    const lastPO = db.prepare(`
      SELECT MAX(CAST(EBELN AS INTEGER)) as last FROM EKKO
    `).get() as { last: number };

    const newEbeln = String(lastPO.last + 1).padStart(10, '0');
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // Calculate total
    const netwr = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Insert header
    db.prepare(`
      INSERT INTO EKKO (EBELN, LIFNR, BEDAT, NETWR, ERNAM, AEDAT)
      VALUES (?, ?, ?, ?, 'COPILOT', ?)
    `).run(newEbeln, lifnr, today, netwr, today);

    // Insert items
    const insertItem = db.prepare(`
      INSERT INTO EKPO (EBELN, EBELP, MATNR, TXZ01, MENGE, NETPR, NETWR)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item, index) => {
      const ebelp = String((index + 1) * 10).padStart(5, '0');
      insertItem.run(newEbeln, ebelp, item.matnr, item.description, item.quantity, item.price, item.quantity * item.price);
    });

    return { success: true, ebeln: newEbeln };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// SALES ORDER OPERATIONS (VBAK, VBAP)
// ============================================================================

export interface SalesOrderHeader {
  VBELN: string;
  KUNNR: string;
  CUSTOMER_NAME?: string;
  ERDAT: string;
  NETWR: number;
  WAERK: string;
  AUART: string;
  BSTNK?: string;
}

export interface SalesOrderItem {
  VBELN: string;
  POSNR: string;
  MATNR: string;
  ARKTX: string;
  KWMENG: number;
  VRKME: string;
  NETWR: number;
  DELIVERED_QTY?: number;
}

export interface SalesOrder extends SalesOrderHeader {
  items: SalesOrderItem[];
}

export function getSalesOrders(): SalesOrderHeader[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT s.*, c.NAME1 as CUSTOMER_NAME
    FROM VBAK s
    LEFT JOIN KNA1 c ON s.KUNNR = c.KUNNR
    ORDER BY s.ERDAT DESC
  `).all() as SalesOrderHeader[];
}

export function getSalesOrderById(vbeln: string): SalesOrder | undefined {
  const db = getDatabase();
  const header = db.prepare(`
    SELECT s.*, c.NAME1 as CUSTOMER_NAME
    FROM VBAK s
    LEFT JOIN KNA1 c ON s.KUNNR = c.KUNNR
    WHERE s.VBELN = ?
  `).get(vbeln) as SalesOrderHeader | undefined;

  if (!header) return undefined;

  const items = db.prepare(`
    SELECT * FROM VBAP WHERE VBELN = ? ORDER BY POSNR
  `).all(vbeln) as SalesOrderItem[];

  return { ...header, items };
}

export function createSalesOrder(
  kunnr: string,
  customerPO: string,
  items: Array<{ matnr: string; quantity: number; description: string }>
): { success: boolean; vbeln?: string; error?: string } {
  const db = getDatabase();

  try {
    // Generate new SO number
    const lastSO = db.prepare(`
      SELECT MAX(CAST(VBELN AS INTEGER)) as last FROM VBAK
    `).get() as { last: number };

    const newVbeln = String(lastSO.last + 1).padStart(10, '0');
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // Get prices and calculate total
    let netwr = 0;
    const itemsWithPrices = items.map(item => {
      const material = getMaterialById(item.matnr);
      const price = material?.STDPRICE || 0;
      const itemTotal = item.quantity * price;
      netwr += itemTotal;
      return { ...item, price, netwr: itemTotal };
    });

    // Insert header
    db.prepare(`
      INSERT INTO VBAK (VBELN, KUNNR, ERDAT, AUDAT, NETWR, BSTNK, AEDAT)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newVbeln, kunnr, today, today, netwr, customerPO, today);

    // Insert items
    const insertItem = db.prepare(`
      INSERT INTO VBAP (VBELN, POSNR, MATNR, ARKTX, KWMENG, NETWR)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    itemsWithPrices.forEach((item, index) => {
      const posnr = String((index + 1) * 10).padStart(6, '0');
      insertItem.run(newVbeln, posnr, item.matnr, item.description, item.quantity, item.netwr);
    });

    // Update customer credit used
    db.prepare(`
      UPDATE KNA1 SET CREDIT_USED = CREDIT_USED + ? WHERE KUNNR = ?
    `).run(netwr, kunnr);

    return { success: true, vbeln: newVbeln };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// DELIVERY OPERATIONS (LIKP, LIPS)
// ============================================================================

export interface Delivery {
  VBELN: string;
  KUNNR: string;
  CUSTOMER_NAME?: string;
  LFDAT: string;
  STATUS: string;
  TRACKING_NUM?: string;
  CARRIER?: string;
}

export function getDeliveries(): Delivery[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT l.*, c.NAME1 as CUSTOMER_NAME
    FROM LIKP l
    LEFT JOIN KNA1 c ON l.KUNNR = c.KUNNR
    ORDER BY l.LFDAT DESC
  `).all() as Delivery[];
}

export function getDeliveryByTracking(tracking: string): Delivery | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT l.*, c.NAME1 as CUSTOMER_NAME
    FROM LIKP l
    LEFT JOIN KNA1 c ON l.KUNNR = c.KUNNR
    WHERE UPPER(l.TRACKING_NUM) = UPPER(?) OR l.VBELN = ?
  `).get(tracking, tracking) as Delivery | undefined;
}

export function updateDeliveryStatus(vbeln: string, status: string, tracking?: string): boolean {
  const db = getDatabase();
  try {
    if (tracking) {
      db.prepare(`UPDATE LIKP SET STATUS = ?, TRACKING_NUM = ? WHERE VBELN = ?`).run(status, tracking, vbeln);
    } else {
      db.prepare(`UPDATE LIKP SET STATUS = ? WHERE VBELN = ?`).run(status, vbeln);
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// INVOICE OPERATIONS (RBKP, RSEG)
// ============================================================================

export interface Invoice {
  BELNR: string;
  GJAHR: string;
  LIFNR: string;
  VENDOR_NAME?: string;
  BLDAT: string;
  RMWWR: number;
  RBSTAT: string;
  XBLNR?: string;
}

export function getInvoices(): Invoice[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, v.NAME1 as VENDOR_NAME
    FROM RBKP r
    LEFT JOIN LFA1 v ON r.LIFNR = v.LIFNR
    ORDER BY r.BLDAT DESC
  `).all() as Invoice[];
}

export function getInvoiceById(belnr: string, gjahr: string): Invoice | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT r.*, v.NAME1 as VENDOR_NAME
    FROM RBKP r
    LEFT JOIN LFA1 v ON r.LIFNR = v.LIFNR
    WHERE r.BELNR = ? AND r.GJAHR = ?
  `).get(belnr, gjahr) as Invoice | undefined;
}

export function getInvoicePaymentStatus(reference: string): { status: string; amount: number; dueDate: string } | undefined {
  const db = getDatabase();
  const invoice = db.prepare(`
    SELECT * FROM RBKP WHERE XBLNR LIKE ? OR BELNR = ?
  `).get(`%${reference}%`, reference) as any;

  if (!invoice) return undefined;

  const statusMap: Record<string, string> = {
    '1': 'PENDING_APPROVAL',
    '2': 'APPROVED',
    '3': 'SCHEDULED_FOR_PAYMENT',
    '4': 'PAYMENT_IN_PROCESS',
    '5': 'PAID'
  };

  // Calculate due date (assuming NET30)
  const docDate = new Date(
    parseInt(invoice.BLDAT.substring(0, 4)),
    parseInt(invoice.BLDAT.substring(4, 6)) - 1,
    parseInt(invoice.BLDAT.substring(6, 8))
  );
  docDate.setDate(docDate.getDate() + 30);

  return {
    status: statusMap[invoice.RBSTAT] || 'UNKNOWN',
    amount: invoice.RMWWR,
    dueDate: docDate.toISOString().split('T')[0]
  };
}

// ============================================================================
// TRANSACTION LOG (For Demo Visualization)
// ============================================================================

export interface TransactionLog {
  ID: number;
  TIMESTAMP: string;
  USER_QUERY: string;
  INTENT: string;
  CONFIDENCE: number;
  BAPI_NAME: string;
  BAPI_PARAMS: string;
  SAP_TABLE: string;
  SAP_OPERATION: string;
  RESULT_STATUS: string;
  RESULT_DATA: string;
  EXECUTION_TIME_MS: number;
  SESSION_ID: string;
}

export function logTransaction(log: Omit<TransactionLog, 'ID' | 'TIMESTAMP'>): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO TRANSACTION_LOG
    (USER_QUERY, INTENT, CONFIDENCE, BAPI_NAME, BAPI_PARAMS, SAP_TABLE, SAP_OPERATION, RESULT_STATUS, RESULT_DATA, EXECUTION_TIME_MS, SESSION_ID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    log.USER_QUERY,
    log.INTENT,
    log.CONFIDENCE,
    log.BAPI_NAME,
    log.BAPI_PARAMS,
    log.SAP_TABLE,
    log.SAP_OPERATION,
    log.RESULT_STATUS,
    log.RESULT_DATA,
    log.EXECUTION_TIME_MS,
    log.SESSION_ID
  );
  return result.lastInsertRowid as number;
}

export function getRecentTransactions(limit: number = 20): TransactionLog[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM TRANSACTION_LOG ORDER BY TIMESTAMP DESC LIMIT ?
  `).all(limit) as TransactionLog[];
}

// ============================================================================
// DASHBOARD / REPORTING
// ============================================================================

export function getDashboardStats() {
  const db = getDatabase();

  const poStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(NETWR) as totalValue,
      COUNT(CASE WHEN date(substr(BEDAT,1,4)||'-'||substr(BEDAT,5,2)||'-'||substr(BEDAT,7,2)) >= date('now', '-7 days') THEN 1 END) as lastWeek
    FROM EKKO
  `).get() as any;

  const soStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(NETWR) as totalValue,
      COUNT(CASE WHEN date(substr(ERDAT,1,4)||'-'||substr(ERDAT,5,2)||'-'||substr(ERDAT,7,2)) >= date('now', '-7 days') THEN 1 END) as lastWeek
    FROM VBAK
  `).get() as any;

  const deliveryStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN STATUS = 'DELIVERED' THEN 1 END) as delivered,
      COUNT(CASE WHEN STATUS = 'IN_TRANSIT' THEN 1 END) as inTransit,
      COUNT(CASE WHEN STATUS IN ('PICKING', 'PROCESSING') THEN 1 END) as pending
    FROM LIKP
  `).get() as any;

  const invoiceStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(RMWWR) as totalValue,
      COUNT(CASE WHEN RBSTAT = '5' THEN 1 END) as paid,
      COUNT(CASE WHEN RBSTAT != '5' THEN 1 END) as pending
    FROM RBKP
  `).get() as any;

  const lowStockItems = db.prepare(`
    SELECT m.MATNR, t.MAKTX, d.LABST as stock, c.MINBE as reorderPoint
    FROM MARA m
    JOIN MAKT t ON m.MATNR = t.MATNR
    JOIN MARC c ON m.MATNR = c.MATNR
    JOIN MARD d ON m.MATNR = d.MATNR
    WHERE d.LABST <= c.MINBE
    ORDER BY d.LABST ASC
    LIMIT 5
  `).all();

  return {
    purchaseOrders: poStats,
    salesOrders: soStats,
    deliveries: deliveryStats,
    invoices: invoiceStats,
    lowStockItems
  };
}
