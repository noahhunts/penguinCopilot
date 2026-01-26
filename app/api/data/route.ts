import { NextResponse } from 'next/server';
import {
  getVendors,
  getCustomers,
  getMaterials,
  getPurchaseOrders,
  getSalesOrders,
  getDeliveries,
  getInvoices,
} from '@/lib/supabase';

export async function GET() {
  try {
    const [vendors, customers, materials, purchaseOrders, salesOrders, deliveries, invoices] = await Promise.all([
      getVendors(),
      getCustomers(),
      getMaterials(),
      getPurchaseOrders(),
      getSalesOrders(),
      getDeliveries(),
      getInvoices(),
    ]);

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
