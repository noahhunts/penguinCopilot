import { NextRequest, NextResponse } from 'next/server';
import { processNaturalLanguage, formatBAPICall } from '@/lib/nlp-processor';
import * as db from '@/lib/database';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Process natural language
    const intent = processNaturalLanguage(query);

    if (!intent) {
      return NextResponse.json({
        message: "I couldn't understand that request. Please try rephrasing.",
        intent: null,
        result: null,
        sqlQuery: '',
        bapiCall: '',
        rawData: null,
        executionTime: Date.now() - startTime,
      });
    }

    // Generate SQL query representation and execute
    let result: any = null;
    let message = '';
    let sqlQuery = '';
    let bapiCall = '';
    let rawData: any = null;

    // Generate BAPI call representation
    if (intent.sapOperation.bapi) {
      bapiCall = generateBAPICall(intent.sapOperation.bapi);
    }

    switch (intent.name) {
      case 'CREATE_PURCHASE_ORDER':
        sqlQuery = generatePOCreateSQL(intent.entities);
        const poResult = await handleCreatePO(intent.entities);
        message = poResult.success
          ? `Purchase Order ${poResult.ebeln} created successfully for $${poResult.totalValue?.toLocaleString()}`
          : `Failed: ${poResult.error}`;
        result = poResult.success ? {
          type: 'po_created',
          documentNumber: poResult.ebeln,
          totalValue: poResult.totalValue,
        } : null;
        rawData = poResult;
        break;

      case 'CREATE_SALES_ORDER':
        sqlQuery = generateSOCreateSQL(intent.entities);
        const soResult = await handleCreateSO(intent.entities);
        message = soResult.success
          ? `Sales Order ${soResult.vbeln} created successfully for $${soResult.totalValue?.toLocaleString()}`
          : `Failed: ${soResult.error}`;
        result = soResult.success ? {
          type: 'so_created',
          documentNumber: soResult.vbeln,
          totalValue: soResult.totalValue,
        } : null;
        rawData = soResult;
        break;

      case 'CHECK_STOCK':
        sqlQuery = `SELECT m.MATNR, t.MAKTX, d.LABST, d.WERKS, d.LGORT
FROM MARA m
JOIN MAKT t ON m.MATNR = t.MATNR
JOIN MARD d ON m.MATNR = d.MATNR
WHERE t.MAKTX LIKE '%${intent.entities.material || ''}%'`;
        const stockResult = await handleCheckStock(intent.entities);
        message = stockResult.available
          ? `${stockResult.material} has ${stockResult.stock} ${stockResult.unit} available in stock.`
          : `${stockResult.material} has ${stockResult.stock} ${stockResult.unit} in stock.`;
        result = { type: 'stock_check', ...stockResult };
        rawData = stockResult;
        break;

      case 'TRACK_SHIPMENT':
        sqlQuery = `SELECT l.VBELN, l.STATUS, l.TRACKING_NUM, l.CARRIER, c.NAME1
FROM LIKP l
JOIN KNA1 c ON l.KUNNR = c.KUNNR
WHERE l.TRACKING_NUM = '${intent.entities.trackingId}'
   OR l.VBELN = '${intent.entities.trackingId}'`;
        const shipmentResult = await handleTrackShipment(intent.entities);
        if (shipmentResult) {
          message = `Shipment ${shipmentResult.tracking || shipmentResult.vbeln}: ${shipmentResult.status}. Carrier: ${shipmentResult.carrier}`;
          result = { type: 'shipment_status', ...shipmentResult };
          rawData = shipmentResult;
        } else {
          message = 'Shipment not found.';
        }
        break;

      case 'CHECK_INVOICE_STATUS':
        sqlQuery = `SELECT r.BELNR, r.GJAHR, r.RMWWR, r.RBSTAT, r.XBLNR, v.NAME1
FROM RBKP r
JOIN LFA1 v ON r.LIFNR = v.LIFNR
WHERE r.XBLNR LIKE '%${intent.entities.invoiceRef}%'`;
        const invoiceResult = await handleInvoiceStatus(intent.entities);
        if (invoiceResult) {
          message = `Invoice Status: ${invoiceResult.status}. Amount: $${invoiceResult.amount.toLocaleString()}`;
          result = { type: 'invoice_status', ...invoiceResult };
          rawData = invoiceResult;
        } else {
          message = 'Invoice not found.';
        }
        break;

      case 'LIST_PURCHASE_ORDERS':
        sqlQuery = `SELECT e.EBELN, e.BEDAT, e.NETWR, v.NAME1 as VENDOR_NAME
FROM EKKO e
JOIN LFA1 v ON e.LIFNR = v.LIFNR
ORDER BY e.BEDAT DESC`;
        const pos = db.getPurchaseOrders();
        message = `Found ${pos.length} purchase orders.`;
        rawData = pos;
        result = {
          type: 'list',
          items: pos.map(po => ({
            'PO #': po.EBELN,
            'Vendor': po.VENDOR_NAME,
            'Date': formatDate(po.BEDAT),
            'Value': `$${po.NETWR.toLocaleString()}`,
          })),
        };
        break;

      case 'LIST_SALES_ORDERS':
        sqlQuery = `SELECT s.VBELN, s.ERDAT, s.NETWR, c.NAME1 as CUSTOMER_NAME
FROM VBAK s
JOIN KNA1 c ON s.KUNNR = c.KUNNR
ORDER BY s.ERDAT DESC`;
        const sos = db.getSalesOrders();
        message = `Found ${sos.length} sales orders.`;
        rawData = sos;
        result = {
          type: 'list',
          items: sos.map(so => ({
            'SO #': so.VBELN,
            'Customer': so.CUSTOMER_NAME,
            'Date': formatDate(so.ERDAT),
            'Value': `$${so.NETWR.toLocaleString()}`,
          })),
        };
        break;

      case 'SEARCH_VENDOR':
        sqlQuery = `SELECT LIFNR, NAME1, NAME2, ORT01, REGIO, TELF1
FROM LFA1
WHERE NAME1 LIKE '%${intent.entities.query || ''}%'
ORDER BY NAME1`;
        const vendors = db.searchVendors(intent.entities.query || '');
        message = `Found ${vendors.length} vendors.`;
        rawData = vendors;
        result = {
          type: 'list',
          items: vendors.map(v => ({
            'ID': v.LIFNR,
            'Name': v.NAME1,
            'City': v.ORT01,
            'State': v.REGIO,
          })),
        };
        break;

      case 'SEARCH_MATERIAL':
        sqlQuery = `SELECT m.MATNR, t.MAKTX, m.MTART, d.LABST, c.STDPRICE
FROM MARA m
JOIN MAKT t ON m.MATNR = t.MATNR
JOIN MARC c ON m.MATNR = c.MATNR
JOIN MARD d ON m.MATNR = d.MATNR
WHERE t.MAKTX LIKE '%${intent.entities.query || ''}%'
ORDER BY t.MAKTX`;
        const materials = db.searchMaterials(intent.entities.query || '');
        message = `Found ${materials.length} materials.`;
        rawData = materials;
        result = {
          type: 'list',
          items: materials.map(m => ({
            'ID': m.MATNR,
            'Description': m.MAKTX,
            'Stock': m.LABST?.toLocaleString() || '0',
            'Price': `$${m.STDPRICE?.toFixed(2) || '0.00'}`,
          })),
        };
        break;

      case 'LIST_VENDORS':
        sqlQuery = `SELECT LIFNR, NAME1, NAME2, ORT01, REGIO, TELF1
FROM LFA1
WHERE LOEVM = ''
ORDER BY NAME1`;
        const allVendors = db.getVendors();
        message = `Found ${allVendors.length} vendors in the system.`;
        rawData = allVendors;
        result = {
          type: 'list',
          items: allVendors.map(v => ({
            'Vendor ID': v.LIFNR,
            'Name': v.NAME1,
            'City': v.ORT01,
            'State': v.REGIO,
          })),
        };
        break;

      case 'LIST_CUSTOMERS':
        sqlQuery = `SELECT KUNNR, NAME1, NAME2, ORT01, REGIO, CREDIT_LIMIT
FROM KNA1
WHERE SPERR = ''
ORDER BY NAME1`;
        const allCustomers = db.getCustomers();
        message = `Found ${allCustomers.length} customers in the system.`;
        rawData = allCustomers;
        result = {
          type: 'list',
          items: allCustomers.map(c => ({
            'Customer ID': c.KUNNR,
            'Name': c.NAME1,
            'City': c.ORT01,
            'Credit Limit': `$${c.CREDIT_LIMIT?.toLocaleString()}`,
          })),
        };
        break;

      case 'LIST_MATERIALS':
        sqlQuery = `SELECT m.MATNR, t.MAKTX, m.MTART, d.LABST, c.STDPRICE
FROM MARA m
JOIN MAKT t ON m.MATNR = t.MATNR AND t.SPRAS = 'E'
JOIN MARC c ON m.MATNR = c.MATNR
JOIN MARD d ON m.MATNR = d.MATNR
WHERE m.LVORM = ''
ORDER BY t.MAKTX`;
        const allMaterials = db.getMaterials();
        message = `Found ${allMaterials.length} materials in the system.`;
        rawData = allMaterials;
        result = {
          type: 'list',
          items: allMaterials.map(m => ({
            'Material ID': m.MATNR,
            'Description': m.MAKTX,
            'Type': m.MTART,
            'Stock': m.LABST?.toLocaleString() || '0',
            'Price': `$${m.STDPRICE?.toFixed(2) || '0.00'}`,
          })),
        };
        break;

      case 'LIST_DELIVERIES':
        sqlQuery = `SELECT l.VBELN, l.LFDAT, l.STATUS, l.TRACKING_NUM, l.CARRIER, c.NAME1
FROM LIKP l
JOIN KNA1 c ON l.KUNNR = c.KUNNR
ORDER BY l.LFDAT DESC`;
        const allDeliveries = db.getDeliveries();
        message = `Found ${allDeliveries.length} deliveries in the system.`;
        rawData = allDeliveries;
        result = {
          type: 'list',
          items: allDeliveries.map(d => ({
            'Delivery #': d.VBELN,
            'Customer': d.CUSTOMER_NAME,
            'Status': d.STATUS,
            'Carrier': d.CARRIER || '-',
            'Tracking': d.TRACKING_NUM || '-',
          })),
        };
        break;

      case 'GENERATE_DAILY_REPORT':
        sqlQuery = `-- Purchase Orders Summary
SELECT COUNT(*) as po_count, SUM(NETWR) as po_value FROM EKKO;

-- Sales Orders Summary
SELECT COUNT(*) as so_count, SUM(NETWR) as so_value FROM VBAK;

-- Deliveries by Status
SELECT STATUS, COUNT(*) FROM LIKP GROUP BY STATUS;`;
        const stats = db.getDashboardStats();
        message = `Report: ${stats.purchaseOrders.total} POs ($${stats.purchaseOrders.totalValue?.toLocaleString()}), ${stats.salesOrders.total} SOs ($${stats.salesOrders.totalValue?.toLocaleString()})`;
        rawData = stats;
        result = {
          type: 'report',
          poCount: stats.purchaseOrders.total,
          poValue: stats.purchaseOrders.totalValue,
          soCount: stats.salesOrders.total,
          soValue: stats.salesOrders.totalValue,
        };
        break;

      default:
        // Try generic list queries
        if (query.toLowerCase().includes('vendor')) {
          sqlQuery = 'SELECT * FROM LFA1 ORDER BY NAME1';
          const allVendors = db.getVendors();
          message = `Found ${allVendors.length} vendors.`;
          rawData = allVendors;
          result = {
            type: 'list',
            items: allVendors.map(v => ({
              'ID': v.LIFNR,
              'Name': v.NAME1,
              'City': v.ORT01,
              'State': v.REGIO,
            })),
          };
        } else if (query.toLowerCase().includes('material') || query.toLowerCase().includes('product')) {
          sqlQuery = `SELECT m.MATNR, t.MAKTX, d.LABST, c.STDPRICE
FROM MARA m
JOIN MAKT t ON m.MATNR = t.MATNR
JOIN MARC c ON m.MATNR = c.MATNR
JOIN MARD d ON m.MATNR = d.MATNR`;
          const allMaterials = db.getMaterials();
          message = `Found ${allMaterials.length} materials.`;
          rawData = allMaterials;
          result = {
            type: 'list',
            items: allMaterials.map(m => ({
              'ID': m.MATNR,
              'Description': m.MAKTX,
              'Stock': m.LABST?.toLocaleString() || '0',
              'Price': `$${m.STDPRICE?.toFixed(2) || '0.00'}`,
            })),
          };
        } else if (query.toLowerCase().includes('customer')) {
          sqlQuery = 'SELECT * FROM KNA1 ORDER BY NAME1';
          const allCustomers = db.getCustomers();
          message = `Found ${allCustomers.length} customers.`;
          rawData = allCustomers;
          result = {
            type: 'list',
            items: allCustomers.map(c => ({
              'ID': c.KUNNR,
              'Name': c.NAME1,
              'City': c.ORT01,
              'Credit Limit': `$${c.CREDIT_LIMIT?.toLocaleString()}`,
            })),
          };
        } else {
          message = 'I understood your request but this operation is not yet implemented.';
        }
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      message,
      intent,
      result,
      sqlQuery,
      bapiCall,
      rawData,
      executionTime,
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({
      error: 'Processing failed',
      message: String(error),
      executionTime: Date.now() - startTime,
    }, { status: 500 });
  }
}

// Helper functions
function generateBAPICall(bapi: any): string {
  let call = `CALL FUNCTION '${bapi.name}'`;

  if (bapi.parameters && Object.keys(bapi.parameters).length > 0) {
    call += '\n  EXPORTING';
    for (const [key, value] of Object.entries(bapi.parameters)) {
      if (value) {
        call += `\n    ${key} = '${value}'`;
      }
    }
  }

  if (bapi.structures && bapi.structures.length > 0) {
    call += '\n  TABLES';
    for (const struct of bapi.structures) {
      call += `\n    ${struct.name} = lt_${struct.name.toLowerCase()}`;
    }
  }

  call += '\n  EXCEPTIONS\n    OTHERS = 1.';

  return call;
}

function generatePOCreateSQL(entities: any): string {
  return `-- Insert PO Header
INSERT INTO EKKO (EBELN, LIFNR, BEDAT, NETWR)
SELECT MAX(EBELN) + 1,
       (SELECT LIFNR FROM LFA1 WHERE NAME1 LIKE '%${entities.vendor || ''}%'),
       DATE('now'),
       ${entities.quantity || 0} * price;

-- Insert PO Item
INSERT INTO EKPO (EBELN, EBELP, MATNR, MENGE, NETPR)
SELECT new_ebeln, '00010',
       (SELECT MATNR FROM MAKT WHERE MAKTX LIKE '%${entities.material || ''}%'),
       ${entities.quantity || 0},
       (SELECT STDPRICE FROM MARC WHERE MATNR = material_id);`;
}

function generateSOCreateSQL(entities: any): string {
  return `-- Insert SO Header
INSERT INTO VBAK (VBELN, KUNNR, ERDAT, NETWR)
SELECT MAX(VBELN) + 1,
       (SELECT KUNNR FROM KNA1 WHERE NAME1 LIKE '%${entities.customer || ''}%'),
       DATE('now'),
       ${entities.quantity || 0} * price;

-- Insert SO Item
INSERT INTO VBAP (VBELN, POSNR, MATNR, KWMENG, NETWR)
SELECT new_vbeln, '000010',
       (SELECT MATNR FROM MAKT WHERE MAKTX LIKE '%${entities.material || ''}%'),
       ${entities.quantity || 0},
       quantity * unit_price;`;
}

async function handleCreatePO(entities: Record<string, any>) {
  const vendorQuery = entities.vendor || '';
  const vendors = db.searchVendors(vendorQuery);
  if (vendors.length === 0) {
    return { success: false, error: 'Vendor not found' };
  }
  const vendor = vendors[0];

  const materialQuery = entities.material || '';
  const materials = db.searchMaterials(materialQuery);
  if (materials.length === 0) {
    return { success: false, error: 'Material not found' };
  }
  const material = materials[0];

  const quantity = entities.quantity || 100;
  const price = material.STDPRICE || 100;

  const result = db.createPurchaseOrder(vendor.LIFNR, [
    {
      matnr: material.MATNR,
      quantity,
      price,
      description: material.MAKTX,
    },
  ]);

  return {
    ...result,
    vendor: vendor.NAME1,
    material: material.MAKTX,
    quantity,
    price,
    totalValue: quantity * price,
  };
}

async function handleCreateSO(entities: Record<string, any>) {
  const customerQuery = entities.customer || '';
  const customers = db.searchCustomers(customerQuery);
  if (customers.length === 0) {
    return { success: false, error: 'Customer not found' };
  }
  const customer = customers[0];

  const materialQuery = entities.material || '';
  const materials = db.searchMaterials(materialQuery);
  if (materials.length === 0) {
    return { success: false, error: 'Material not found' };
  }
  const material = materials[0];

  const quantity = entities.quantity || 50;
  const customerPO = `CUST-${Date.now()}`;

  const result = db.createSalesOrder(customer.KUNNR, customerPO, [
    {
      matnr: material.MATNR,
      quantity,
      description: material.MAKTX,
    },
  ]);

  return {
    ...result,
    customer: customer.NAME1,
    material: material.MAKTX,
    quantity,
    totalValue: quantity * (material.STDPRICE || 100),
  };
}

async function handleCheckStock(entities: Record<string, any>) {
  const materialQuery = entities.material || '';
  const materials = db.searchMaterials(materialQuery);

  if (materials.length === 0) {
    return {
      material: materialQuery,
      stock: 0,
      unit: 'EA',
      available: false,
    };
  }

  const material = materials[0];
  const quantity = entities.quantity || 1;
  const availability = db.checkMaterialAvailability(material.MATNR, quantity);

  return {
    material: material.MAKTX,
    materialId: material.MATNR,
    stock: availability.stock,
    unit: material.MEINS,
    requestedQty: quantity,
    available: availability.available,
  };
}

async function handleTrackShipment(entities: Record<string, any>) {
  const trackingId = entities.trackingId || '';
  const delivery = db.getDeliveryByTracking(trackingId);

  if (!delivery) return null;

  return {
    vbeln: delivery.VBELN,
    status: delivery.STATUS,
    tracking: delivery.TRACKING_NUM,
    carrier: delivery.CARRIER,
    customer: delivery.CUSTOMER_NAME,
    deliveryDate: formatDate(delivery.LFDAT),
  };
}

async function handleInvoiceStatus(entities: Record<string, any>) {
  const invoiceRef = entities.invoiceRef || '';
  return db.getInvoicePaymentStatus(invoiceRef);
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}
