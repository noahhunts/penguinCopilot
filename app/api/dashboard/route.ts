import { NextResponse } from 'next/server';
import * as db from '@/lib/database';

export async function GET() {
  try {
    const stats = db.getDashboardStats();

    return NextResponse.json({
      purchaseOrders: {
        total: stats.purchaseOrders.total,
        totalValue: stats.purchaseOrders.totalValue,
        lastWeek: stats.purchaseOrders.lastWeek,
      },
      salesOrders: {
        total: stats.salesOrders.total,
        totalValue: stats.salesOrders.totalValue,
        lastWeek: stats.salesOrders.lastWeek,
      },
      deliveries: {
        total: stats.deliveries.total,
        delivered: stats.deliveries.delivered,
        inTransit: stats.deliveries.inTransit,
        pending: stats.deliveries.pending,
      },
      invoices: {
        total: stats.invoices.total,
        totalValue: stats.invoices.totalValue,
        paid: stats.invoices.paid,
        pending: stats.invoices.pending,
      },
      lowStockItems: stats.lowStockItems,
      recentTransactions: db.getRecentTransactions(10),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
