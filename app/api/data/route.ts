import { NextResponse } from 'next/server';
import * as db from '@/lib/database';

export async function GET() {
  try {
    const vendors = db.getVendors();
    const customers = db.getCustomers();
    const materials = db.getMaterials();
    const purchaseOrders = db.getPurchaseOrders();
    const salesOrders = db.getSalesOrders();
    const deliveries = db.getDeliveries();
    const invoices = db.getInvoices();

    return NextResponse.json({
      vendors,
      customers,
      materials,
      purchaseOrders,
      salesOrders,
      deliveries,
      invoices,
    });
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
