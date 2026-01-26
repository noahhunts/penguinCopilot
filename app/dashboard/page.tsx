'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Package,
  Truck,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Database,
  Zap,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface DashboardData {
  purchaseOrders: {
    total: number;
    totalValue: number;
    lastWeek: number;
  };
  salesOrders: {
    total: number;
    totalValue: number;
    lastWeek: number;
  };
  deliveries: {
    total: number;
    delivered: number;
    inTransit: number;
    pending: number;
  };
  invoices: {
    total: number;
    totalValue: number;
    paid: number;
    pending: number;
  };
  lowStockItems: Array<{
    MATNR: string;
    MAKTX: string;
    stock: number;
    reorderPoint: number;
  }>;
  recentTransactions: Array<{
    ID: number;
    TIMESTAMP: string;
    USER_QUERY: string;
    INTENT: string;
    RESULT_STATUS: string;
    EXECUTION_TIME_MS: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-azure-500" />
          <span className="text-white/70">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="logo-microsoft">
              <div className="logo-microsoft-grid">
                <div></div><div></div><div></div><div></div>
              </div>
              <span className="text-white font-semibold">Microsoft</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-azure-500" />
              <span className="font-semibold text-white">SAP Operations Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-azure-500/20 hover:bg-azure-500/30 border border-azure-500/30 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-azure-400" />
              <span className="text-sm text-azure-400">Open Copilot</span>
            </Link>
            <button
              onClick={fetchDashboard}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Purchase Orders"
            value={data?.purchaseOrders.total || 0}
            subtitle={`$${(data?.purchaseOrders.totalValue || 0).toLocaleString()}`}
            change={`${data?.purchaseOrders.lastWeek || 0} this week`}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="azure"
          />
          <KPICard
            title="Sales Orders"
            value={data?.salesOrders.total || 0}
            subtitle={`$${(data?.salesOrders.totalValue || 0).toLocaleString()}`}
            change={`${data?.salesOrders.lastWeek || 0} this week`}
            icon={<Package className="w-6 h-6" />}
            color="green"
          />
          <KPICard
            title="Deliveries"
            value={data?.deliveries.total || 0}
            subtitle={`${data?.deliveries.delivered || 0} delivered`}
            change={`${data?.deliveries.inTransit || 0} in transit`}
            icon={<Truck className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="Invoices"
            value={data?.invoices.total || 0}
            subtitle={`$${(data?.invoices.totalValue || 0).toLocaleString()}`}
            change={`${data?.invoices.paid || 0} paid`}
            icon={<FileText className="w-6 h-6" />}
            color="gold"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent AI Transactions */}
          <div className="col-span-2 card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-azure-500" />
              Recent AI Transactions
            </h3>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.slice(0, 8).map((tx) => (
                  <motion.div
                    key={tx.ID}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${tx.RESULT_STATUS === 'SUCCESS' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {tx.RESULT_STATUS === 'SUCCESS' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate">{tx.USER_QUERY}</p>
                        <p className="text-xs text-white/50">{tx.INTENT}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tx.EXECUTION_TIME_MS}ms
                      </span>
                      <span>{new Date(tx.TIMESTAMP).toLocaleTimeString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="text-white/50">No AI transactions yet</p>
                <Link href="/" className="text-azure-400 text-sm hover:underline mt-2 inline-block">
                  Start using Copilot →
                </Link>
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Low Stock Alerts
            </h3>
            {data?.lowStockItems && data.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockItems.map((item) => (
                  <div
                    key={item.MATNR}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                  >
                    <p className="text-sm font-medium text-white truncate">{item.MAKTX}</p>
                    <p className="text-xs text-white/50 font-mono">{item.MATNR}</p>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-yellow-400">
                        Stock: {item.stock.toLocaleString()}
                      </span>
                      <span className="text-white/50">
                        Reorder: {item.reorderPoint.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500/50" />
                <p className="text-white/50 text-sm">All stock levels healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Status Overview */}
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-500" />
            Delivery Pipeline
          </h3>
          <div className="flex items-center justify-between">
            <DeliveryStage
              label="Processing"
              count={data?.deliveries.pending || 0}
              color="yellow"
            />
            <ArrowRight className="w-6 h-6 text-white/20" />
            <DeliveryStage
              label="In Transit"
              count={data?.deliveries.inTransit || 0}
              color="azure"
            />
            <ArrowRight className="w-6 h-6 text-white/20" />
            <DeliveryStage
              label="Delivered"
              count={data?.deliveries.delivered || 0}
              color="green"
            />
          </div>
        </div>

        {/* SAP Integration Status */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <IntegrationStatus service="SAP ECC" status="connected" latency="12ms" />
          <IntegrationStatus service="Azure OpenAI" status="connected" latency="145ms" />
          <IntegrationStatus service="Azure Bot Service" status="connected" latency="23ms" />
          <IntegrationStatus service="OData Gateway" status="connected" latency="8ms" />
        </div>
      </main>
    </div>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  change,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  change: string;
  icon: React.ReactNode;
  color: 'azure' | 'green' | 'purple' | 'gold';
}) {
  const colorClasses = {
    azure: 'from-azure-500/20 to-azure-500/5 border-azure-500/30 text-azure-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    gold: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-white/70">{title}</span>
        <div className={`p-2 rounded-lg bg-white/10 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="stat-value text-3xl">{value}</div>
      <div className="text-sm text-white/50 mt-1">{subtitle}</div>
      <div className="text-xs text-white/40 mt-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {change}
      </div>
    </motion.div>
  );
}

function DeliveryStage({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: 'yellow' | 'azure' | 'green';
}) {
  const colorClasses = {
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    azure: 'bg-azure-500/20 border-azure-500/30 text-azure-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
  };

  return (
    <div className={`flex-1 p-4 rounded-xl border ${colorClasses[color]} text-center`}>
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
    </div>
  );
}

function IntegrationStatus({
  service,
  status,
  latency,
}: {
  service: string;
  status: 'connected' | 'disconnected';
  latency: string;
}) {
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
        <span className="text-sm font-medium text-white">{service}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{status === 'connected' ? 'Connected' : 'Disconnected'}</span>
        <span className="font-mono">{latency}</span>
      </div>
    </div>
  );
}
