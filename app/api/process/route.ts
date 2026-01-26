import { NextRequest, NextResponse } from 'next/server';
import { processNaturalLanguage } from '@/lib/nlp-processor';
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
        message: "I couldn't understand that request. Please try rephrasing or use one of the sample queries.",
        intent: null,
        result: null,
        executionTime: Date.now() - startTime,
      });
    }

    // Execute the appropriate operation based on intent
    let result: any = null;
    let message = '';

    switch (intent.name) {
      case 'CREATE_PURCHASE_ORDER':
        result = await handleCreatePO(intent.entities);
        message = result.success
          ? `Purchase Order ${result.ebeln} has been created successfully.`
          : `Failed to create Purchase Order: ${result.error}`;
        if (result.success) {
          result = {
            type: 'po_created',
            documentNumber: result.ebeln,
            totalValue: result.totalValue,
          };
        }
        break;

      case 'CREATE_SALES_ORDER':
        result = await handleCreateSO(intent.entities);
        message = result.success
          ? `Sales Order ${result.vbeln} has been created successfully.`
          : `Failed to create Sales Order: ${result.error}`;
        if (result.success) {
          result = {
            type: 'so_created',
            documentNumber: result.vbeln,
            totalValue: result.totalValue,
          };
        }
        break;

      case 'CHECK_STOCK':
        result = await handleCheckStock(intent.entities);
        message = result.available
          ? `${result.material} has ${result.stock} ${result.unit} available in stock.`
          : `${result.material} has only ${result.stock} ${result.unit} in stock (below requested quantity).`;
        result = {
          type: 'stock_check',
          ...result,
        };
        break;

      case 'TRACK_SHIPMENT':
        result = await handleTrackShipment(intent.entities);
        if (result) {
          message = `Shipment ${result.tracking || result.vbeln} is currently ${result.status}.${result.carrier ? ` Carrier: ${result.carrier}` : ''}`;
          result = {
            type: 'shipment_status',
            ...result,
          };
        } else {
          message = 'Shipment not found. Please verify the tracking number.';
          result = null;
        }
        break;

      case 'CHECK_INVOICE_STATUS':
        result = await handleInvoiceStatus(intent.entities);
        if (result) {
          message = `Invoice status: ${result.status}. Amount: $${result.amount.toLocaleString()}. Due: ${result.dueDate}`;
          result = {
            type: 'invoice_status',
            ...result,
          };
        } else {
          message = 'Invoice not found. Please verify the invoice reference.';
          result = null;
        }
        break;

      case 'GET_PO_STATUS':
        result = await handleGetPO(intent.entities);
        if (result) {
          message = `Purchase Order ${result.EBELN} for ${result.VENDOR_NAME}: Total value $${result.NETWR.toLocaleString()}`;
          result = {
            type: 'po_details',
            ...result,
          };
        } else {
          message = 'Purchase Order not found.';
          result = null;
        }
        break;

      case 'GET_SO_STATUS':
        result = await handleGetSO(intent.entities);
        if (result) {
          message = `Sales Order ${result.VBELN} for ${result.CUSTOMER_NAME}: Total value $${result.NETWR.toLocaleString()}`;
          result = {
            type: 'so_details',
            ...result,
          };
        } else {
          message = 'Sales Order not found.';
          result = null;
        }
        break;

      case 'LIST_PURCHASE_ORDERS':
        const pos = db.getPurchaseOrders();
        message = `Found ${pos.length} purchase orders.`;
        result = {
          type: 'list',
          items: pos.map(po => ({
            'PO Number': po.EBELN,
            'Vendor': po.VENDOR_NAME,
            'Date': formatDate(po.BEDAT),
            'Value': `$${po.NETWR.toLocaleString()}`,
            'Status': po.STATU || 'Active',
          })),
        };
        break;

      case 'LIST_SALES_ORDERS':
        const sos = db.getSalesOrders();
        message = `Found ${sos.length} sales orders.`;
        result = {
          type: 'list',
          items: sos.map(so => ({
            'SO Number': so.VBELN,
            'Customer': so.CUSTOMER_NAME,
            'Date': formatDate(so.ERDAT),
            'Value': `$${so.NETWR.toLocaleString()}`,
            'Customer PO': so.BSTNK || '-',
          })),
        };
        break;

      case 'GENERATE_DAILY_REPORT':
        const stats = db.getDashboardStats();
        message = `Daily Report: ${stats.purchaseOrders.lastWeek} POs and ${stats.salesOrders.lastWeek} SOs in the last 7 days.`;
        result = {
          type: 'report',
          poCount: stats.purchaseOrders.total,
          poValue: stats.purchaseOrders.totalValue,
          soCount: stats.salesOrders.total,
          soValue: stats.salesOrders.totalValue,
          deliveriesInTransit: stats.deliveries.inTransit,
          deliveriesPending: stats.deliveries.pending,
          lowStockItems: stats.lowStockItems,
        };
        break;

      case 'SEARCH_VENDOR':
        const vendors = db.searchVendors(intent.entities.query || '');
        message = `Found ${vendors.length} matching vendors.`;
        result = {
          type: 'list',
          items: vendors.map(v => ({
            'Vendor ID': v.LIFNR,
            'Name': v.NAME1,
            'City': v.ORT01,
            'State': v.REGIO,
            'Phone': v.TELF1,
          })),
        };
        break;

      case 'SEARCH_MATERIAL':
        const materials = db.searchMaterials(intent.entities.query || '');
        message = `Found ${materials.length} matching materials.`;
        result = {
          type: 'list',
          items: materials.map(m => ({
            'Material': m.MATNR,
            'Description': m.MAKTX,
            'Type': m.MTART,
            'Stock': m.LABST?.toLocaleString() || '0',
            'Price': `$${m.STDPRICE?.toFixed(2) || '0.00'}`,
          })),
        };
        break;

      case 'UPDATE_DELIVERY_STATUS':
        const updated = db.updateDeliveryStatus(
          intent.entities.deliveryId,
          intent.entities.status
        );
        message = updated
          ? `Delivery ${intent.entities.deliveryId} status updated to ${intent.entities.status}.`
          : 'Failed to update delivery status.';
        result = {
          type: 'update',
          success: updated,
          deliveryId: intent.entities.deliveryId,
          newStatus: intent.entities.status,
        };
        break;

      default:
        message = 'Operation not yet implemented.';
        result = null;
    }

    const executionTime = Date.now() - startTime;

    // Log the transaction for demo purposes
    try {
      db.logTransaction({
        USER_QUERY: query,
        INTENT: intent.name,
        CONFIDENCE: intent.confidence,
        BAPI_NAME: intent.sapOperation.bapi?.name || '',
        BAPI_PARAMS: JSON.stringify(intent.sapOperation.bapi?.parameters || {}),
        SAP_TABLE: intent.sapOperation.tables.join(', '),
        SAP_OPERATION: intent.sapOperation.type,
        RESULT_STATUS: result ? 'SUCCESS' : 'NO_RESULT',
        RESULT_DATA: JSON.stringify(result || {}),
        EXECUTION_TIME_MS: executionTime,
        SESSION_ID: 'DEMO',
      });
    } catch (e) {
      // Log error but don't fail the request
      console.error('Failed to log transaction:', e);
    }

    return NextResponse.json({
      message,
      intent,
      result,
      executionTime,
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({
      error: 'Processing failed',
      message: 'An error occurred while processing your request.',
      executionTime: Date.now() - startTime,
    }, { status: 500 });
  }
}

// Handler functions
async function handleCreatePO(entities: Record<string, any>) {
  // Find vendor
  const vendorQuery = entities.vendor || '';
  const vendors = db.searchVendors(vendorQuery);
  if (vendors.length === 0) {
    return { success: false, error: 'Vendor not found' };
  }
  const vendor = vendors[0];

  // Find material
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
    totalValue: quantity * price,
  };
}

async function handleCreateSO(entities: Record<string, any>) {
  // Find customer
  const customerQuery = entities.customer || '';
  const customers = db.searchCustomers(customerQuery);
  if (customers.length === 0) {
    return { success: false, error: 'Customer not found' };
  }
  const customer = customers[0];

  // Find material
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

  if (!delivery) {
    return null;
  }

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
  const status = db.getInvoicePaymentStatus(invoiceRef);

  return status;
}

async function handleGetPO(entities: Record<string, any>) {
  const poNumber = entities.poNumber || '';
  // Pad with zeros if needed
  const paddedPO = poNumber.padStart(10, '0');
  return db.getPurchaseOrderById(paddedPO);
}

async function handleGetSO(entities: Record<string, any>) {
  const soNumber = entities.soNumber || '';
  const paddedSO = soNumber.padStart(10, '0');
  return db.getSalesOrderById(paddedSO);
}

// Utility function
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}
