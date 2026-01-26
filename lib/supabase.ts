import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role for full access
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types for SAP tables
export interface Vendor {
  lifnr: string;
  name1: string;
  name2?: string;
  stras?: string;
  ort01?: string;
  pstlz?: string;
  regio?: string;
  telf1?: string;
  stcd1?: string;
  erdat?: string;
  loevm?: string;
}

export interface Customer {
  kunnr: string;
  name1: string;
  name2?: string;
  stras?: string;
  ort01?: string;
  pstlz?: string;
  regio?: string;
  telf1?: string;
  credit_limit?: number;
  sperr?: string;
}

export interface Material {
  matnr: string;
  mtart?: string;
  matkl?: string;
  meins?: string;
  maktx?: string;
  stdprice?: number;
  labst?: number;
}

export interface PurchaseOrder {
  ebeln: string;
  lifnr: string;
  bedat?: string;
  netwr?: number;
  waers?: string;
  vendor_name?: string;
}

export interface SalesOrder {
  vbeln: string;
  kunnr: string;
  erdat?: string;
  netwr?: number;
  waerk?: string;
  bstnk?: string;
  customer_name?: string;
}

export interface Delivery {
  vbeln: string;
  kunnr: string;
  lfdat?: string;
  status?: string;
  tracking_num?: string;
  carrier?: string;
  customer_name?: string;
}

export interface Invoice {
  belnr: string;
  gjahr: string;
  lifnr: string;
  xblnr?: string;
  bldat?: string;
  budat?: string;
  rmwwr?: number;
  waers?: string;
  rbstat?: string;
  vendor_name?: string;
}

// Database functions
export async function getVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('lfa1')
    .select('*')
    .order('name1');

  if (error) throw error;
  return data || [];
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('kna1')
    .select('*')
    .order('name1');

  if (error) throw error;
  return data || [];
}

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('mara')
    .select(`
      matnr,
      mtart,
      matkl,
      meins,
      makt!inner(maktx),
      marc!inner(stdprice),
      mard!inner(labst)
    `)
    .order('matnr');

  if (error) {
    console.error('Error fetching materials:', error);
    // Fallback to simpler query
    const { data: simpleData } = await supabase
      .from('mara')
      .select('*')
      .order('matnr');
    return simpleData || [];
  }

  // Flatten the joined data
  return (data || []).map((m: any) => ({
    matnr: m.matnr,
    mtart: m.mtart,
    matkl: m.matkl,
    meins: m.meins,
    maktx: m.makt?.[0]?.maktx || m.makt?.maktx,
    stdprice: m.marc?.[0]?.stdprice || m.marc?.stdprice,
    labst: m.mard?.[0]?.labst || m.mard?.labst,
  }));
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('ekko')
    .select(`
      ebeln,
      lifnr,
      bedat,
      netwr,
      waers,
      lfa1!inner(name1)
    `)
    .order('bedat', { ascending: false });

  if (error) throw error;

  return (data || []).map((po: any) => ({
    ebeln: po.ebeln,
    lifnr: po.lifnr,
    bedat: po.bedat,
    netwr: po.netwr,
    waers: po.waers,
    vendor_name: po.lfa1?.name1,
  }));
}

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const { data, error } = await supabase
    .from('vbak')
    .select(`
      vbeln,
      kunnr,
      erdat,
      netwr,
      waerk,
      bstnk,
      kna1!inner(name1)
    `)
    .order('erdat', { ascending: false });

  if (error) throw error;

  return (data || []).map((so: any) => ({
    vbeln: so.vbeln,
    kunnr: so.kunnr,
    erdat: so.erdat,
    netwr: so.netwr,
    waerk: so.waerk,
    bstnk: so.bstnk,
    customer_name: so.kna1?.name1,
  }));
}

export async function getDeliveries(): Promise<Delivery[]> {
  const { data, error } = await supabase
    .from('likp')
    .select(`
      vbeln,
      kunnr,
      lfdat,
      status,
      tracking_num,
      carrier,
      kna1!inner(name1)
    `)
    .order('lfdat', { ascending: false });

  if (error) throw error;

  return (data || []).map((d: any) => ({
    vbeln: d.vbeln,
    kunnr: d.kunnr,
    lfdat: d.lfdat,
    status: d.status,
    tracking_num: d.tracking_num,
    carrier: d.carrier,
    customer_name: d.kna1?.name1,
  }));
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('rbkp')
    .select(`
      belnr,
      gjahr,
      lifnr,
      xblnr,
      bldat,
      budat,
      rmwwr,
      waers,
      rbstat,
      lfa1!inner(name1)
    `)
    .order('budat', { ascending: false });

  if (error) throw error;

  return (data || []).map((inv: any) => ({
    belnr: inv.belnr,
    gjahr: inv.gjahr,
    lifnr: inv.lifnr,
    xblnr: inv.xblnr,
    bldat: inv.bldat,
    budat: inv.budat,
    rmwwr: inv.rmwwr,
    waers: inv.waers,
    rbstat: inv.rbstat,
    vendor_name: inv.lfa1?.name1,
  }));
}

export async function searchVendors(query: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('lfa1')
    .select('*')
    .ilike('name1', `%${query}%`)
    .order('name1');

  if (error) throw error;
  return data || [];
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('kna1')
    .select('*')
    .ilike('name1', `%${query}%`)
    .order('name1');

  if (error) throw error;
  return data || [];
}

export async function searchMaterials(query: string): Promise<Material[]> {
  // First try searching in makt (material descriptions)
  const { data, error } = await supabase
    .from('makt')
    .select('matnr, maktx')
    .ilike('maktx', `%${query}%`)
    .order('maktx');

  if (error) {
    console.error('Error searching materials:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get full material data for matching materials
  const matnrs = data.map(d => d.matnr);
  const results: Material[] = [];

  for (const item of data) {
    // Get mara data
    const { data: maraData } = await supabase
      .from('mara')
      .select('mtart, matkl, meins')
      .eq('matnr', item.matnr)
      .single();

    // Get marc data (price)
    const { data: marcData } = await supabase
      .from('marc')
      .select('stdprice')
      .eq('matnr', item.matnr)
      .limit(1)
      .single();

    // Get mard data (stock)
    const { data: mardData } = await supabase
      .from('mard')
      .select('labst')
      .eq('matnr', item.matnr)
      .limit(1)
      .single();

    results.push({
      matnr: item.matnr,
      maktx: item.maktx,
      mtart: maraData?.mtart,
      matkl: maraData?.matkl,
      meins: maraData?.meins,
      stdprice: marcData?.stdprice,
      labst: mardData?.labst,
    });
  }

  return results;
}

export async function checkMaterialAvailability(matnr: string, quantity: number): Promise<{ available: boolean; stock: number }> {
  const { data, error } = await supabase
    .from('mard')
    .select('labst')
    .eq('matnr', matnr)
    .single();

  if (error || !data) {
    return { available: false, stock: 0 };
  }

  return {
    available: data.labst >= quantity,
    stock: data.labst,
  };
}

export async function getDeliveryByTracking(tracking: string): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from('likp')
    .select(`
      vbeln,
      kunnr,
      lfdat,
      status,
      tracking_num,
      carrier,
      kna1!inner(name1)
    `)
    .or(`tracking_num.ilike.%${tracking}%,vbeln.eq.${tracking}`)
    .single();

  if (error || !data) return null;

  return {
    vbeln: data.vbeln,
    kunnr: data.kunnr,
    lfdat: data.lfdat,
    status: data.status,
    tracking_num: data.tracking_num,
    carrier: data.carrier,
    customer_name: (data as any).kna1?.name1,
  };
}

export async function getInvoicePaymentStatus(invoiceRef: string): Promise<any> {
  const { data, error } = await supabase
    .from('rbkp')
    .select(`
      belnr,
      rmwwr,
      rbstat,
      lfa1!inner(name1)
    `)
    .ilike('xblnr', `%${invoiceRef}%`)
    .single();

  if (error || !data) return null;

  return {
    invoiceNumber: data.belnr,
    amount: data.rmwwr,
    status: data.rbstat,
    vendor: (data as any).lfa1?.name1,
  };
}

export async function createPurchaseOrder(vendorId: string, items: Array<{ matnr: string; quantity: number; price: number; description: string }>): Promise<{ success: boolean; ebeln?: string; error?: string }> {
  // Generate new PO number
  const { data: maxPO } = await supabase
    .from('ekko')
    .select('ebeln')
    .order('ebeln', { ascending: false })
    .limit(1)
    .single();

  const newEbeln = String(Number((maxPO?.ebeln || '4500000100')) + 1).padStart(10, '0');
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Insert PO header
  const { error: headerError } = await supabase
    .from('ekko')
    .insert({
      ebeln: newEbeln,
      lifnr: vendorId,
      bedat: new Date().toISOString().split('T')[0],
      netwr: totalValue,
    });

  if (headerError) {
    return { success: false, error: headerError.message };
  }

  // Insert PO items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await supabase
      .from('ekpo')
      .insert({
        ebeln: newEbeln,
        ebelp: String((i + 1) * 10).padStart(5, '0'),
        matnr: item.matnr,
        txz01: item.description,
        menge: item.quantity,
        netpr: item.price,
      });
  }

  return { success: true, ebeln: newEbeln };
}

export async function createSalesOrder(customerId: string, customerPO: string, items: Array<{ matnr: string; quantity: number; description: string }>): Promise<{ success: boolean; vbeln?: string; error?: string }> {
  // Generate new SO number
  const { data: maxSO } = await supabase
    .from('vbak')
    .select('vbeln')
    .order('vbeln', { ascending: false })
    .limit(1)
    .single();

  const newVbeln = String(Number((maxSO?.vbeln || '0000012300')) + 1).padStart(10, '0');

  // Get material prices
  let totalValue = 0;
  for (const item of items) {
    const { data: price } = await supabase
      .from('marc')
      .select('stdprice')
      .eq('matnr', item.matnr)
      .single();
    totalValue += item.quantity * (price?.stdprice || 100);
  }

  // Insert SO header
  const { error: headerError } = await supabase
    .from('vbak')
    .insert({
      vbeln: newVbeln,
      kunnr: customerId,
      erdat: new Date().toISOString().split('T')[0],
      netwr: totalValue,
      bstnk: customerPO,
    });

  if (headerError) {
    return { success: false, error: headerError.message };
  }

  // Insert SO items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { data: price } = await supabase
      .from('marc')
      .select('stdprice')
      .eq('matnr', item.matnr)
      .single();

    await supabase
      .from('vbap')
      .insert({
        vbeln: newVbeln,
        posnr: String((i + 1) * 10).padStart(6, '0'),
        matnr: item.matnr,
        arktx: item.description,
        kwmeng: item.quantity,
        netwr: item.quantity * (price?.stdprice || 100),
      });
  }

  return { success: true, vbeln: newVbeln };
}

export async function getDashboardStats() {
  const [vendors, customers, materials, purchaseOrders, salesOrders, deliveries] = await Promise.all([
    getVendors(),
    getCustomers(),
    getMaterials(),
    getPurchaseOrders(),
    getSalesOrders(),
    getDeliveries(),
  ]);

  return {
    vendors: { total: vendors.length },
    customers: { total: customers.length },
    materials: { total: materials.length },
    purchaseOrders: {
      total: purchaseOrders.length,
      totalValue: purchaseOrders.reduce((sum, po) => sum + (po.netwr || 0), 0),
    },
    salesOrders: {
      total: salesOrders.length,
      totalValue: salesOrders.reduce((sum, so) => sum + (so.netwr || 0), 0),
    },
    deliveries: {
      total: deliveries.length,
      inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
      delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
    },
  };
}
