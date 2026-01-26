// Natural Language Processing Simulation for SAP Integration Demo
// This simulates how Azure OpenAI / Copilot would process natural language queries

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  sapOperation: SAPOperation;
}

export interface SAPOperation {
  type: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CHECK';
  tables: string[];
  bapi?: BAPIMapping;
  tcodes?: string[];
}

export interface BAPIMapping {
  name: string;
  description: string;
  parameters: Record<string, any>;
  structures: BAPIStructure[];
}

export interface BAPIStructure {
  name: string;
  fields: Record<string, any>;
}

// Intent patterns for demo - simulates Azure Language Understanding
const intentPatterns: Array<{
  patterns: RegExp[];
  intent: string;
  extractors: Record<string, (match: string) => any>;
}> = [
  // Purchase Order Creation - "create PO for 50 steel beams from Acme"
  {
    patterns: [
      /create\s+(?:a\s+)?(?:purchase\s+order|po)\s+(?:for\s+)?(\d+)\s+(?:units?\s+(?:of\s+)?)?(.+?)\s+from\s+(.+)/i,
    ],
    intent: 'CREATE_PURCHASE_ORDER',
    extractors: {
      quantity: (m) => parseInt(m),
      material: (m) => m,
      vendor: (m) => m,
    },
  },
  // Purchase Order Creation - "create PO from Acme for 50 steel beams"
  {
    patterns: [
      /create\s+(?:a\s+)?(?:purchase\s+order|po)\s+from\s+(.+?)\s+for\s+(\d+)\s+(?:units?\s+(?:of\s+)?)?(.+)/i,
      /(?:new|make)\s+(?:purchase\s+order|po)\s+(?:from\s+|vendor\s+)(.+?)\s+(\d+)\s+(.+)/i,
    ],
    intent: 'CREATE_PURCHASE_ORDER',
    extractors: {
      vendor: (m) => m,
      quantity: (m) => parseInt(m),
      material: (m) => m,
    },
  },
  // Sales Order Creation - "create SO for 50 laptops for TechCorp"
  {
    patterns: [
      /create\s+(?:a\s+)?(?:sales\s+order|so)\s+(?:for\s+)?(\d+)\s+(?:units?\s+(?:of\s+)?)?(.+?)\s+(?:for|to)\s+(.+)/i,
    ],
    intent: 'CREATE_SALES_ORDER',
    extractors: {
      quantity: (m) => parseInt(m),
      material: (m) => m,
      customer: (m) => m,
    },
  },
  // Sales Order Creation - "create SO for customer TechCorp for 50 laptops"
  {
    patterns: [
      /create\s+(?:a\s+)?(?:sales\s+order|so)\s+(?:for\s+)?(?:customer\s+)?(.+?)\s+for\s+(\d+)\s+(?:units?\s+(?:of\s+)?)?(.+)/i,
      /(?:new|make)\s+(?:sales\s+order|so)\s+(.+?)\s+(\d+)\s+(.+)/i,
    ],
    intent: 'CREATE_SALES_ORDER',
    extractors: {
      customer: (m) => m,
      quantity: (m) => parseInt(m),
      material: (m) => m,
    },
  },
  // Stock Check
  {
    patterns: [
      /(?:check|what(?:'s| is)|do we have)\s+(?:the\s+)?(?:stock|inventory|availability)\s+(?:of|for)\s+(.+)/i,
      /(?:how much|how many)\s+(.+?)\s+(?:do we have|in stock|available)/i,
      /(?:is|are)\s+(.+?)\s+(?:in stock|available)/i,
    ],
    intent: 'CHECK_STOCK',
    extractors: {
      material: (m) => m,
    },
  },
  // Invoice Payment Status - MUST come before shipment tracking to avoid "status of" collision
  {
    patterns: [
      /(?:what(?:'s| is)|check)\s+(?:the\s+)?(?:payment\s+)?status\s+(?:of|for)\s+invoice\s*(.+)/i,
      /(?:when will|has)\s+invoice\s*(.+?)\s+(?:be paid|been paid)/i,
      /invoice\s*(.+?)\s+(?:payment\s+)?status/i,
      /status\s+(?:of|for)\s+invoice\s*(.+)/i,
    ],
    intent: 'CHECK_INVOICE_STATUS',
    extractors: {
      invoiceRef: (m) => m.trim().replace(/\?$/, ''),
    },
  },
  // Shipment Tracking - requires "shipment", "delivery", or tracking number pattern
  {
    patterns: [
      /(?:where is|track)\s+(?:shipment|delivery|order)\s*(?:#|number|num)?\s*(.+)/i,
      /(?:status of)\s+(?:shipment|delivery)\s*(?:#|number|num)?\s*(.+)/i,
      /(?:tracking|shipment)\s+(?:status|info|information)\s+(?:for\s+)?(.+)/i,
      /track\s+(?:#|number|num)?\s*([A-Z]{2,4}[-]?\d{6,})/i,
    ],
    intent: 'TRACK_SHIPMENT',
    extractors: {
      trackingId: (m) => m.trim(),
    },
  },
  // PO Status
  {
    patterns: [
      /(?:show|get|what(?:'s| is))\s+(?:the\s+)?(?:status|details?)\s+(?:of|for)\s+(?:purchase\s+order|po)\s*(?:#|number)?\s*(.+)/i,
      /(?:purchase\s+order|po)\s*(?:#|number)?\s*(.+?)\s+(?:status|details?)/i,
    ],
    intent: 'GET_PO_STATUS',
    extractors: {
      poNumber: (m) => m.trim().replace(/^#/, '').replace(/\?$/, ''),
    },
  },
  // SO Status
  {
    patterns: [
      /(?:show|get|what(?:'s| is))\s+(?:the\s+)?(?:status|details?)\s+(?:of|for)\s+(?:sales\s+order|so)\s*(?:#|number)?\s*(.+)/i,
      /(?:sales\s+order|so)\s*(?:#|number)?\s*(.+?)\s+(?:status|details?)/i,
    ],
    intent: 'GET_SO_STATUS',
    extractors: {
      soNumber: (m) => m.trim().replace(/^#/, '').replace(/\?$/, ''),
    },
  },
  // List Purchase Orders
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?(?:purchase\s+orders?|pos)/i,
      /(?:what|how many)\s+(?:purchase\s+orders?|pos)\s+(?:do we have|are there)/i,
      /purchase\s+orders?/i,
    ],
    intent: 'LIST_PURCHASE_ORDERS',
    extractors: {},
  },
  // List Sales Orders
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?(?:sales\s+orders?|sos)/i,
      /(?:what|how many)\s+(?:sales\s+orders?|sos)\s+(?:do we have|are there)/i,
      /sales\s+orders?/i,
    ],
    intent: 'LIST_SALES_ORDERS',
    extractors: {},
  },
  // List Vendors
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?vendors?/i,
      /(?:what|how many)\s+vendors?\s+(?:do we have|are there)/i,
      /(?:all\s+)?vendors?$/i,
    ],
    intent: 'LIST_VENDORS',
    extractors: {},
  },
  // List Customers
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?customers?/i,
      /(?:what|how many)\s+customers?\s+(?:do we have|are there)/i,
      /(?:all\s+)?customers?$/i,
    ],
    intent: 'LIST_CUSTOMERS',
    extractors: {},
  },
  // List Materials
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?(?:materials?|products?|items?|inventory)/i,
      /(?:what|how many)\s+(?:materials?|products?)\s+(?:do we have|are there)/i,
      /(?:all\s+)?(?:materials?|products?)$/i,
    ],
    intent: 'LIST_MATERIALS',
    extractors: {},
  },
  // List Deliveries
  {
    patterns: [
      /(?:show|list|get|display)\s+(?:all\s+)?(?:the\s+)?(?:deliveries|shipments)/i,
      /(?:what|how many)\s+(?:deliveries|shipments)\s+(?:do we have|are there)/i,
    ],
    intent: 'LIST_DELIVERIES',
    extractors: {},
  },
  // Daily Report
  {
    patterns: [
      /(?:generate|show|get)\s+(?:the\s+)?(?:daily|today'?s?)\s+(?:report|summary)/i,
      /(?:what happened|summary)\s+(?:today|yesterday)/i,
    ],
    intent: 'GENERATE_DAILY_REPORT',
    extractors: {},
  },
  // Update Delivery
  {
    patterns: [
      /update\s+(?:delivery|shipment)\s+(?:status\s+)?(?:for\s+)?(.+?)\s+(?:to|as)\s+(.+)/i,
      /(?:mark|set)\s+(?:delivery|shipment)\s+(.+?)\s+(?:as\s+)?(.+)/i,
    ],
    intent: 'UPDATE_DELIVERY_STATUS',
    extractors: {
      deliveryId: (m) => m.trim(),
      status: (m) => m.trim().toUpperCase(),
    },
  },
  // Vendor Search
  {
    patterns: [
      /(?:find|search|lookup)\s+vendor\s+(.+)/i,
      /(?:who is|info(?:rmation)? (?:on|about))\s+vendor\s+(.+)/i,
    ],
    intent: 'SEARCH_VENDOR',
    extractors: {
      query: (m) => m.trim(),
    },
  },
  // Material Search
  {
    patterns: [
      /(?:find|search|lookup)\s+(?:material|product|item)\s+(.+)/i,
      /(?:what is|info(?:rmation)? (?:on|about))\s+(?:material|product)\s+(.+)/i,
    ],
    intent: 'SEARCH_MATERIAL',
    extractors: {
      query: (m) => m.trim(),
    },
  },
];

// BAPI Mappings for each intent
const bapiMappings: Record<string, (entities: Record<string, any>) => BAPIMapping> = {
  CREATE_PURCHASE_ORDER: (entities) => ({
    name: 'BAPI_PO_CREATE1',
    description: 'Create Purchase Order',
    parameters: {
      TESTRUN: '',
    },
    structures: [
      {
        name: 'POHEADER',
        fields: {
          COMP_CODE: '1000',
          DOC_TYPE: 'NB',
          VENDOR: entities.vendorId || '',
          PURCH_ORG: '1000',
          PUR_GROUP: '001',
          DOC_DATE: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          CURRENCY: 'USD',
        },
      },
      {
        name: 'POITEM',
        fields: {
          PO_ITEM: '00010',
          MATERIAL: entities.materialId || '',
          PLANT: '1000',
          QUANTITY: entities.quantity || 0,
          PO_UNIT: 'EA',
          NET_PRICE: entities.price || 0,
        },
      },
      {
        name: 'POSCHEDULE',
        fields: {
          PO_ITEM: '00010',
          SCHED_LINE: '0001',
          DELIVERY_DATE: entities.deliveryDate || '',
          QUANTITY: entities.quantity || 0,
        },
      },
    ],
  }),

  CREATE_SALES_ORDER: (entities) => ({
    name: 'BAPI_SALESORDER_CREATEFROMDAT2',
    description: 'Create Sales Order',
    parameters: {},
    structures: [
      {
        name: 'ORDER_HEADER_IN',
        fields: {
          DOC_TYPE: 'OR',
          SALES_ORG: '1000',
          DISTR_CHAN: '10',
          DIVISION: '00',
          REQ_DATE_H: entities.deliveryDate || '',
          PURCH_NO_C: entities.customerPO || '',
          CURRENCY: 'USD',
        },
      },
      {
        name: 'ORDER_ITEMS_IN',
        fields: {
          ITM_NUMBER: '000010',
          MATERIAL: entities.materialId || '',
          TARGET_QTY: entities.quantity || 0,
          TARGET_QU: 'EA',
          PLANT: '1000',
        },
      },
      {
        name: 'ORDER_PARTNERS',
        fields: {
          PARTN_ROLE: 'AG',
          PARTN_NUMB: entities.customerId || '',
        },
      },
    ],
  }),

  CHECK_STOCK: (entities) => ({
    name: 'BAPI_MATERIAL_AVAILABILITY',
    description: 'Check Material Availability (ATP)',
    parameters: {
      PLANT: '1000',
      MATERIAL: entities.materialId || '',
      UNIT: 'EA',
      CHECK_RULE: 'A',
    },
    structures: [
      {
        name: 'WMDVSX',
        fields: {
          REQ_DATE: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          REQ_QTY: entities.quantity || 1,
        },
      },
    ],
  }),

  TRACK_SHIPMENT: (entities) => ({
    name: 'BAPI_DELIVERY_GETLIST',
    description: 'Get Delivery Information',
    parameters: {
      VBELN: entities.trackingId || '',
    },
    structures: [],
  }),

  CHECK_INVOICE_STATUS: (entities) => ({
    name: 'BAPI_INCOMINGINVOICE_GETDETAIL',
    description: 'Get Invoice Details',
    parameters: {
      INVOICEDOCNUMBER: entities.invoiceRef || '',
      FISCALYEAR: new Date().getFullYear().toString(),
    },
    structures: [],
  }),

  GET_PO_STATUS: (entities) => ({
    name: 'BAPI_PO_GETDETAIL1',
    description: 'Get Purchase Order Details',
    parameters: {
      PURCHASEORDER: entities.poNumber || '',
    },
    structures: [],
  }),

  GET_SO_STATUS: (entities) => ({
    name: 'BAPI_SALESORDER_GETLIST',
    description: 'Get Sales Order Details',
    parameters: {
      SALESDOCUMENT: entities.soNumber || '',
    },
    structures: [],
  }),

  UPDATE_DELIVERY_STATUS: (entities) => ({
    name: 'BAPI_GOODSMVT_CREATE',
    description: 'Goods Movement / Delivery Update',
    parameters: {},
    structures: [
      {
        name: 'GOODSMVT_HEADER',
        fields: {
          PSTNG_DATE: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          DOC_DATE: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        },
      },
      {
        name: 'GOODSMVT_CODE',
        fields: {
          GM_CODE: '01',
        },
      },
    ],
  }),

  LIST_PURCHASE_ORDERS: () => ({
    name: 'BAPI_PO_GETITEMS',
    description: 'List Purchase Orders',
    parameters: {
      PURCHASINGORGANIZATION: '1000',
    },
    structures: [],
  }),

  LIST_SALES_ORDERS: () => ({
    name: 'BAPI_SALESORDER_GETLIST',
    description: 'List Sales Orders',
    parameters: {
      SALES_ORGANIZATION: '1000',
    },
    structures: [],
  }),

  LIST_VENDORS: () => ({
    name: 'BAPI_VENDOR_GETLIST',
    description: 'Get Vendor List',
    parameters: {
      COMPANY_CODE: '1000',
    },
    structures: [],
  }),

  LIST_CUSTOMERS: () => ({
    name: 'BAPI_CUSTOMER_GETLIST',
    description: 'Get Customer List',
    parameters: {
      SALES_ORGANIZATION: '1000',
    },
    structures: [],
  }),

  LIST_MATERIALS: () => ({
    name: 'BAPI_MATERIAL_GETLIST',
    description: 'Get Material List',
    parameters: {
      PLANT: '1000',
    },
    structures: [],
  }),

  LIST_DELIVERIES: () => ({
    name: 'BAPI_DELIVERY_GETLIST',
    description: 'Get Delivery List',
    parameters: {
      SHIPPING_POINT: '1000',
    },
    structures: [],
  }),

  GENERATE_DAILY_REPORT: () => ({
    name: 'CUSTOM_DAILY_REPORT',
    description: 'Generate Daily Summary Report',
    parameters: {
      DATE_FROM: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      DATE_TO: new Date().toISOString().split('T')[0],
    },
    structures: [],
  }),

  SEARCH_VENDOR: (entities) => ({
    name: 'BAPI_VENDOR_GETLIST',
    description: 'Search Vendors',
    parameters: {
      SEARCHTERM: entities.query || '',
    },
    structures: [],
  }),

  SEARCH_MATERIAL: (entities) => ({
    name: 'BAPI_MATERIAL_GETLIST',
    description: 'Search Materials',
    parameters: {
      SEARCHTERM: entities.query || '',
    },
    structures: [],
  }),
};

// SAP Table mappings
const tablesByIntent: Record<string, string[]> = {
  CREATE_PURCHASE_ORDER: ['EKKO', 'EKPO', 'EKET'],
  CREATE_SALES_ORDER: ['VBAK', 'VBAP', 'VBEP'],
  CHECK_STOCK: ['MARD', 'MARC', 'MARA'],
  TRACK_SHIPMENT: ['LIKP', 'LIPS', 'VBFA'],
  CHECK_INVOICE_STATUS: ['RBKP', 'RSEG', 'BSEG'],
  GET_PO_STATUS: ['EKKO', 'EKPO'],
  GET_SO_STATUS: ['VBAK', 'VBAP'],
  UPDATE_DELIVERY_STATUS: ['LIKP', 'LIPS', 'MKPF', 'MSEG'],
  LIST_PURCHASE_ORDERS: ['EKKO', 'EKPO', 'LFA1'],
  LIST_SALES_ORDERS: ['VBAK', 'VBAP', 'KNA1'],
  LIST_VENDORS: ['LFA1'],
  LIST_CUSTOMERS: ['KNA1'],
  LIST_MATERIALS: ['MARA', 'MAKT', 'MARC', 'MARD'],
  LIST_DELIVERIES: ['LIKP', 'LIPS', 'KNA1'],
  GENERATE_DAILY_REPORT: ['EKKO', 'EKPO', 'VBAK', 'VBAP', 'LIKP'],
  SEARCH_VENDOR: ['LFA1'],
  SEARCH_MATERIAL: ['MARA', 'MAKT'],
};

// T-Code mappings
const tcodesByIntent: Record<string, string[]> = {
  CREATE_PURCHASE_ORDER: ['ME21N'],
  CREATE_SALES_ORDER: ['VA01'],
  CHECK_STOCK: ['MMBE', 'MD04'],
  TRACK_SHIPMENT: ['VL03N'],
  CHECK_INVOICE_STATUS: ['MIR4', 'FBL1N'],
  GET_PO_STATUS: ['ME23N'],
  GET_SO_STATUS: ['VA03'],
  UPDATE_DELIVERY_STATUS: ['VL02N', 'MIGO'],
  LIST_PURCHASE_ORDERS: ['ME2M', 'ME2L'],
  LIST_SALES_ORDERS: ['VA05', 'VA05N'],
  LIST_VENDORS: ['XK03', 'FBL1N'],
  LIST_CUSTOMERS: ['XD03', 'FBL5N'],
  LIST_MATERIALS: ['MM03', 'MMBE'],
  LIST_DELIVERIES: ['VL06O', 'VL03N'],
  GENERATE_DAILY_REPORT: ['ME2M', 'VA05'],
  SEARCH_VENDOR: ['XK03'],
  SEARCH_MATERIAL: ['MM03'],
};

// Main NLP processing function
export function processNaturalLanguage(query: string): Intent | null {
  const normalizedQuery = query.trim().toLowerCase();

  for (const pattern of intentPatterns) {
    for (const regex of pattern.patterns) {
      const match = normalizedQuery.match(regex);
      if (match) {
        const entities: Record<string, any> = {};
        const extractorKeys = Object.keys(pattern.extractors);

        extractorKeys.forEach((key, index) => {
          if (match[index + 1]) {
            entities[key] = pattern.extractors[key](match[index + 1]);
          }
        });

        const confidence = calculateConfidence(query, pattern.intent, entities);
        const bapi = bapiMappings[pattern.intent]?.(entities);

        return {
          name: pattern.intent,
          confidence,
          entities,
          sapOperation: {
            type: getOperationType(pattern.intent),
            tables: tablesByIntent[pattern.intent] || [],
            bapi,
            tcodes: tcodesByIntent[pattern.intent],
          },
        };
      }
    }
  }

  // Fallback - try to determine intent from keywords
  return fallbackIntentDetection(query);
}

function getOperationType(intent: string): 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CHECK' {
  if (intent.startsWith('CREATE_')) return 'CREATE';
  if (intent.startsWith('UPDATE_')) return 'UPDATE';
  if (intent.startsWith('CHECK_') || intent.startsWith('TRACK_')) return 'CHECK';
  if (intent.startsWith('DELETE_')) return 'DELETE';
  return 'READ';
}

function calculateConfidence(query: string, intent: string, entities: Record<string, any>): number {
  let confidence = 0.7; // Base confidence for pattern match

  // Increase confidence for more specific queries
  if (Object.keys(entities).length > 0) {
    confidence += 0.1 * Math.min(Object.keys(entities).length, 3);
  }

  // Increase confidence for longer queries (more context)
  if (query.length > 30) confidence += 0.05;
  if (query.length > 50) confidence += 0.05;

  // Cap at 0.98
  return Math.min(confidence, 0.98);
}

function fallbackIntentDetection(query: string): Intent | null {
  const normalized = query.toLowerCase();

  // Keyword-based fallback
  if (normalized.includes('po') || normalized.includes('purchase')) {
    if (normalized.includes('create') || normalized.includes('new')) {
      return createFallbackIntent('CREATE_PURCHASE_ORDER', 0.5);
    }
    return createFallbackIntent('LIST_PURCHASE_ORDERS', 0.5);
  }

  if (normalized.includes('so') || normalized.includes('sales')) {
    if (normalized.includes('create') || normalized.includes('new')) {
      return createFallbackIntent('CREATE_SALES_ORDER', 0.5);
    }
    return createFallbackIntent('LIST_SALES_ORDERS', 0.5);
  }

  if (normalized.includes('stock') || normalized.includes('inventory') || normalized.includes('availability')) {
    return createFallbackIntent('CHECK_STOCK', 0.5);
  }

  if (normalized.includes('shipment') || normalized.includes('delivery') || normalized.includes('tracking')) {
    return createFallbackIntent('TRACK_SHIPMENT', 0.5);
  }

  if (normalized.includes('invoice') || normalized.includes('payment')) {
    return createFallbackIntent('CHECK_INVOICE_STATUS', 0.5);
  }

  if (normalized.includes('report') || normalized.includes('summary')) {
    return createFallbackIntent('GENERATE_DAILY_REPORT', 0.5);
  }

  return null;
}

function createFallbackIntent(intentName: string, confidence: number): Intent {
  const bapi = bapiMappings[intentName]?.({});

  return {
    name: intentName,
    confidence,
    entities: {},
    sapOperation: {
      type: getOperationType(intentName),
      tables: tablesByIntent[intentName] || [],
      bapi,
      tcodes: tcodesByIntent[intentName],
    },
  };
}

// Export utility to format BAPI call for display
export function formatBAPICall(bapi: BAPIMapping): string {
  let output = `CALL FUNCTION '${bapi.name}'`;

  if (Object.keys(bapi.parameters).length > 0) {
    output += '\n  EXPORTING';
    for (const [key, value] of Object.entries(bapi.parameters)) {
      output += `\n    ${key} = '${value}'`;
    }
  }

  if (bapi.structures.length > 0) {
    output += '\n  TABLES';
    for (const struct of bapi.structures) {
      output += `\n    ${struct.name} = lt_${struct.name.toLowerCase()}`;
    }
  }

  return output;
}

// Export utility to format structure for display
export function formatStructure(structure: BAPIStructure): string {
  let output = `wa_${structure.name.toLowerCase()} = VALUE #(`;
  const fields = Object.entries(structure.fields)
    .map(([key, value]) => `  ${key} = '${value}'`)
    .join('\n');
  output += '\n' + fields + '\n)';
  return output;
}
