# SAP Copilot Integration Demo

**Penguin Solutions x Microsoft Azure**

An AI-powered natural language interface for SAP ERP demonstrating end-to-end integration capabilities.

## Overview

This demo showcases how natural language queries are processed through the Microsoft Azure ecosystem to interact with SAP ERP systems. The visual pipeline demonstrates:

1. **User Query** - Natural language input via chat interface
2. **Azure OpenAI** - NLP processing and understanding
3. **Intent Recognition** - Identifying user intent and extracting entities
4. **BAPI Translation** - Mapping to appropriate SAP function modules
5. **SAP Execution** - Executing operations against SAP tables
6. **Response** - Formatted results returned to user

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with realistic SAP data
npm run seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Demo Features

### Natural Language Capabilities

The demo supports these natural language operations:

| Operation | Example Query |
|-----------|--------------|
| Create Purchase Order | "Create a PO for Acme Industrial Supply for 100 units of Industrial Pump Motor 5HP" |
| Create Sales Order | "Create a sales order for TechFlow Industries for 50 Frequency Drives" |
| Check Stock | "What's the stock level for Centrifugal Pump CP-200?" |
| Track Shipment | "Track shipment FDX-789456123" |
| Invoice Status | "What is the payment status of invoice INV-ACME-2024-001?" |
| List POs | "Show me all purchase orders" |
| List SOs | "Show me all sales orders" |
| Daily Report | "Generate today's daily report" |

### SAP Data Structure

The demo includes realistic SAP table structures:

| Table | Description | Records |
|-------|-------------|---------|
| LFA1 | Vendor Master | 10 |
| KNA1 | Customer Master | 10 |
| MARA/MAKT | Material Master | 27 |
| MARC | Plant Data | 27 |
| MARD | Stock Data | 27 |
| EKKO/EKPO | Purchase Orders | 10+ |
| VBAK/VBAP | Sales Orders | 10+ |
| LIKP/LIPS | Deliveries | 7 |
| RBKP/RSEG | Invoices | 5 |

### BAPI Mappings

The demo shows proper BAPI translations:

- `BAPI_PO_CREATE1` - Create Purchase Order
- `BAPI_SALESORDER_CREATEFROMDAT2` - Create Sales Order
- `BAPI_MATERIAL_AVAILABILITY` - ATP Check
- `BAPI_GOODSMVT_CREATE` - Goods Movement
- `BAPI_DELIVERY_GETLIST` - Delivery Information
- `BAPI_INCOMINGINVOICE_GETDETAIL` - Invoice Details

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Layer    │────▶│  Azure Services │────▶│  SAP Layer      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • MS Teams      │     │ • Azure OpenAI  │     │ • SAP ECC/S4    │
│ • Web Portal    │     │ • Bot Service   │     │ • BAPIs/RFC     │
│ • Mobile App    │     │ • Functions     │     │ • OData         │
│ • Slack         │     │ • API Mgmt      │     │ • Connector     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Pages

- **/** - Main Copilot Chat Interface with Pipeline Visualization
- **/dashboard** - SAP Operations Dashboard with KPIs

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, SQLite (better-sqlite3)
- **Styling**: Custom Microsoft/Azure themed components

## Key Files

```
├── app/
│   ├── page.tsx              # Main chat interface
│   ├── dashboard/page.tsx    # Operations dashboard
│   └── api/
│       ├── process/route.ts  # NLP processing endpoint
│       └── dashboard/route.ts # Dashboard data endpoint
├── lib/
│   ├── database.ts           # SAP data operations
│   └── nlp-processor.ts      # Intent recognition & BAPI mapping
├── scripts/
│   └── seed-database.js      # Database seeder with SAP data
└── data/
    └── sap_demo.db           # SQLite database
```

## Demo Script

1. **Start** - Open the demo at localhost:3000
2. **Architecture** - Click "Show Architecture" to explain the solution
3. **Pipeline** - Demonstrate a query and watch the visual pipeline
4. **Create PO** - "Create a PO for Acme Industrial Supply for 100 pumps"
5. **Check Stock** - "What's the stock for Centrifugal Pump?"
6. **Track Shipment** - "Track shipment FDX-789456123"
7. **Dashboard** - Navigate to /dashboard for KPIs

## Security Features (Shown in Architecture)

- Azure Active Directory SSO
- Role-Based Access Control
- End-to-End Encryption
- Audit Logging
- SOC 2 Type II / GDPR / ISO 27001 Compliance

---

**Penguin Solutions** | Enterprise Demo | Powered by Microsoft Azure
