import { test, expect } from '@playwright/test';

test.describe('SAP Copilot Demo - Full Test Suite', () => {

  test.describe('Page Load & Initial State', () => {

    test('should load the main page successfully', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/SAP Copilot/);
      console.log('✅ Page loads with correct title');
    });

    test('should display Microsoft branding in header', async ({ page }) => {
      await page.goto('/');
      const microsoftText = page.locator('text=Microsoft Azure');
      await expect(microsoftText).toBeVisible();
      console.log('✅ Microsoft branding visible');
    });

    test('should display SAP Connected status', async ({ page }) => {
      await page.goto('/');
      const statusBadge = page.locator('text=SAP Connected');
      await expect(statusBadge).toBeVisible();
      console.log('✅ SAP Connected status visible');
    });

    test('should display Penguin Solutions branding', async ({ page }) => {
      await page.goto('/');
      const penguinText = page.locator('text=PENGUIN SOLUTIONS');
      await expect(penguinText).toBeVisible();
      console.log('✅ Penguin Solutions branding visible');
    });

    test('should have four navigation tabs', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=Chat Interface')).toBeVisible();
      await expect(page.locator('text=Live SAP Data')).toBeVisible();
      await expect(page.locator('text=Processing Pipeline')).toBeVisible();
      await expect(page.locator('text=Architecture')).toBeVisible();
      console.log('✅ All four tabs visible');
    });
  });

  test.describe('Tab Navigation', () => {

    test('should switch to Live SAP Data tab', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');
      await expect(page.locator('text=Live SAP Database Tables')).toBeVisible({ timeout: 10000 });
      console.log('✅ Live SAP Data tab switches correctly');
    });

    test('should switch to Processing Pipeline tab', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Processing Pipeline');
      await expect(page.locator('text=Integration Pipeline')).toBeVisible();
      console.log('✅ Processing Pipeline tab switches correctly');
    });

    test('should switch back to Chat Interface tab', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');
      await page.click('text=Chat Interface');
      // Check for the new welcome text
      await expect(page.locator('text=SAP Copilot Assistant')).toBeVisible();
      console.log('✅ Chat Interface tab switches correctly');
    });
  });

  test.describe('Live SAP Data Tab', () => {

    test('should display vendor table with data', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');

      // Wait for the table header to be visible first
      const vendorTable = page.locator('text=LFA1 - Vendor Master');
      await expect(vendorTable).toBeVisible({ timeout: 10000 });

      // Check for vendor data - use first() since vendor name appears in multiple tables
      const acmeVendor = page.locator('text=Acme Industrial Supply').first();
      await expect(acmeVendor).toBeVisible({ timeout: 10000 });
      console.log('✅ Vendor table displays with Acme Industrial Supply');
    });

    test('should display customer table with data', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');

      const customerTable = page.locator('text=KNA1 - Customer Master');
      await expect(customerTable).toBeVisible({ timeout: 10000 });

      // Check for a customer - use first() since customer name appears in multiple tables
      const aerospaceCustomer = page.locator('text=Aerospace Components Inc').first();
      await expect(aerospaceCustomer).toBeVisible({ timeout: 10000 });
      console.log('✅ Customer table displays with Aerospace Components Inc');
    });

    test('should display materials table with data', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');
      await page.waitForTimeout(2000);

      const materialsTable = page.locator('text=MARA/MAKT - Materials');
      await expect(materialsTable).toBeVisible({ timeout: 10000 });
      console.log('✅ Materials table displays');
    });

    test('should display purchase orders table', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');
      await page.waitForTimeout(2000);

      const poTable = page.locator('text=EKKO/EKPO - Purchase Orders');
      await expect(poTable).toBeVisible({ timeout: 10000 });
      console.log('✅ Purchase Orders table displays');
    });

    test('should have refresh button', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Live SAP Data');

      const refreshButton = page.locator('text=Refresh');
      await expect(refreshButton).toBeVisible();
      console.log('✅ Refresh button visible');
    });
  });

  test.describe('Chat Interface - Sample Queries', () => {

    test('should display quick actions sidebar', async ({ page }) => {
      await page.goto('/');

      // Quick actions are now in a persistent sidebar - use first() for duplicates
      await expect(page.locator('text=Quick Actions').first()).toBeVisible();
      await expect(page.locator('text=Show me all vendors').first()).toBeVisible();
      await expect(page.locator('text=Show purchase orders').first()).toBeVisible();
      console.log('✅ Quick actions sidebar visible');
    });

    test('should have functional chat input', async ({ page }) => {
      await page.goto('/');

      const input = page.locator('input[placeholder*="natural language"]');
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
      console.log('✅ Chat input is visible and enabled');
    });
  });

  test.describe('Chat Functionality - Query Execution', () => {

    test('should execute "Show me all vendors" query', async ({ page }) => {
      await page.goto('/');

      // Click the sample query button
      await page.click('text=Show me all vendors');

      // Wait for processing to complete
      await page.waitForTimeout(4000);

      // Switch back to chat tab to see the result message
      await page.click('text=Chat Interface');
      await page.waitForTimeout(500);

      // Should show results - message format is "Found X vendors in the system."
      const vendorsFound = page.locator('text=/Found \\d+ vendors/');
      await expect(vendorsFound.first()).toBeVisible({ timeout: 15000 });
      console.log('✅ "Show me all vendors" query executes successfully');
    });

    test('should show processing pipeline during query', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Show me all vendors');

      // Check pipeline is visible
      await expect(page.locator('text=Integration Pipeline')).toBeVisible({ timeout: 5000 });
      console.log('✅ Pipeline visualization shown during processing');
    });

    test('should execute stock check query', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Check stock for Industrial Pump Motor');

      // Wait for processing to complete
      await page.waitForTimeout(4000);

      // Switch back to chat tab to see the result message
      await page.click('text=Chat Interface');
      await page.waitForTimeout(500);

      // Should show stock result - message format: "X has Y [unit] available in stock"
      const stockResult = page.locator('text=/has \\d+.*in stock/');
      await expect(stockResult.first()).toBeVisible({ timeout: 15000 });
      console.log('✅ Stock check query returns results');
    });

    test('should execute tracking query', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Track shipment FDX-789456123');
      await page.waitForTimeout(4000);

      // Should show delivery status
      const statusResult = page.locator('text=/DELIVERED|IN_TRANSIT|PROCESSING/');
      await expect(statusResult).toBeVisible({ timeout: 15000 });
      console.log('✅ Shipment tracking query returns status');
    });

    test('should type and submit custom query', async ({ page }) => {
      await page.goto('/');

      const input = page.locator('input[placeholder*="natural language"]');
      await input.fill('Show all customers');
      await input.press('Enter');

      // Wait for processing to complete
      await page.waitForTimeout(4000);

      // Switch back to chat tab to see the result message
      await page.click('text=Chat Interface');
      await page.waitForTimeout(500);

      // Message format: "Found X customers in the system." or "Found X customers."
      const customersFound = page.locator('text=/Found \\d+ customers/');
      await expect(customersFound.first()).toBeVisible({ timeout: 15000 });
      console.log('✅ Custom query submission works');
    });
  });

  test.describe('Processing Details Panel', () => {

    test('should show intent recognition after query', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Show me all vendors');
      await page.waitForTimeout(4000);

      // Click back to chat to see details
      await page.click('text=Chat Interface');
      await page.waitForTimeout(1000);

      const intentLabel = page.locator('text=Detected Intent');
      await expect(intentLabel).toBeVisible({ timeout: 10000 });
      console.log('✅ Intent recognition displayed');
    });

    test('should show SQL query after execution', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Show me all vendors');
      await page.waitForTimeout(4000);

      await page.click('text=Chat Interface');
      await page.waitForTimeout(1000);

      // Label changed to "SQL Query" in the new UI
      const sqlLabel = page.locator('text=SQL Query').first();
      await expect(sqlLabel).toBeVisible({ timeout: 10000 });
      console.log('✅ SQL query displayed');
    });

    test('should show SAP tables accessed', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Show me all vendors');
      await page.waitForTimeout(4000);

      await page.click('text=Chat Interface');
      await page.waitForTimeout(1000);

      // Label changed to "SAP Tables" in the new UI
      const tablesLabel = page.locator('text=SAP Tables').first();
      await expect(tablesLabel).toBeVisible({ timeout: 10000 });

      // Check for LFA1 table - use first() since it may appear in multiple places
      const lfa1Table = page.locator('text=LFA1');
      await expect(lfa1Table.first()).toBeVisible();
      console.log('✅ SAP tables (LFA1) displayed');
    });

    test('should show T-codes', async ({ page }) => {
      await page.goto('/');

      await page.click('text=Show me all vendors');
      await page.waitForTimeout(4000);

      await page.click('text=Chat Interface');
      await page.waitForTimeout(1000);

      // Label changed to "T-Codes" in the new UI
      const tcodesLabel = page.locator('text=T-Codes').first();
      await expect(tcodesLabel).toBeVisible({ timeout: 10000 });
      console.log('✅ T-codes displayed');
    });
  });

  test.describe('Pipeline Visualization', () => {

    test('should show all 7 pipeline stages', async ({ page }) => {
      await page.goto('/');
      await page.click('text=Processing Pipeline');

      // New enhanced pipeline has 7 stages
      await expect(page.locator('text=User Query Received')).toBeVisible();
      await expect(page.locator('text=Azure OpenAI Processing')).toBeVisible();
      await expect(page.locator('text=Intent Classification')).toBeVisible();
      await expect(page.locator('text=Entity Extraction')).toBeVisible();
      await expect(page.locator('text=BAPI/RFC Mapping')).toBeVisible();
      await expect(page.locator('text=SAP System Execution')).toBeVisible();
      await expect(page.locator('text=Response Generation')).toBeVisible();
      console.log('✅ All 7 pipeline stages visible');
    });

    test('should animate through stages during query', async ({ page }) => {
      await page.goto('/');

      // Start a query
      await page.click('text=Show purchase orders');

      // Should see Processing indicator
      const processing = page.locator('text=Processing');
      await expect(processing.first()).toBeVisible({ timeout: 5000 });
      console.log('✅ Pipeline animation shows processing state');
    });
  });

  test.describe('API Endpoints', () => {

    test('should return data from /api/data endpoint', async ({ request }) => {
      const response = await request.get('/api/data');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.vendors).toBeDefined();
      expect(data.customers).toBeDefined();
      expect(data.materials).toBeDefined();
      expect(data.purchaseOrders).toBeDefined();
      expect(data.salesOrders).toBeDefined();
      expect(data.deliveries).toBeDefined();

      expect(data.vendors.length).toBeGreaterThan(0);
      expect(data.customers.length).toBeGreaterThan(0);
      expect(data.materials.length).toBeGreaterThan(0);
      console.log(`✅ API /api/data returns: ${data.vendors.length} vendors, ${data.customers.length} customers, ${data.materials.length} materials`);
    });

    test('should process query via /api/process-detailed', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: 'Show me all vendors' }
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.intent).toBeDefined();
      expect(data.intent.name).toBe('LIST_VENDORS');
      expect(data.sqlQuery).toBeDefined();
      expect(data.result).toBeDefined();
      console.log(`✅ API /api/process-detailed works: Intent=${data.intent.name}`);
    });

    test('should create PO via API', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: 'Create PO for Acme Industrial for 25 pumps' }
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.intent.name).toBe('CREATE_PURCHASE_ORDER');
      expect(data.result).toBeDefined();
      expect(data.result.type).toBe('po_created');
      expect(data.result.documentNumber).toBeDefined();
      console.log(`✅ PO Creation works: Created PO ${data.result.documentNumber}`);
    });

    test('should check stock via API', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: 'Check stock for Centrifugal Pump' }
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.intent.name).toBe('CHECK_STOCK');
      expect(data.result.stock).toBeDefined();
      console.log(`✅ Stock check works: ${data.result.material} has ${data.result.stock} units`);
    });

    test('should track shipment via API', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: 'Track shipment FDX-789456123' }
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.intent.name).toBe('TRACK_SHIPMENT');
      expect(data.result.status).toBeDefined();
      console.log(`✅ Shipment tracking works: Status=${data.result.status}`);
    });
  });

  test.describe('Error Handling', () => {

    test('should handle unknown query gracefully', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: 'xyzzy gibberish query' }
      });
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.message).toContain("couldn't understand");
      console.log('✅ Unknown query handled gracefully');
    });

    test('should handle empty query', async ({ request }) => {
      const response = await request.post('/api/process-detailed', {
        data: { query: '' }
      });

      // Should return error or handle gracefully
      const data = await response.json();
      expect(data.error || data.message).toBeDefined();
      console.log('✅ Empty query handled');
    });
  });

  test.describe('Visual Design & UX', () => {

    test('should have dark theme styling', async ({ page }) => {
      await page.goto('/');

      const body = page.locator('body');
      const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
      // Dark theme should have dark background
      expect(bgColor).not.toBe('rgb(255, 255, 255)');
      console.log('✅ Dark theme applied');
    });

    test('should have gradient branding elements', async ({ page }) => {
      await page.goto('/');

      const gradientElement = page.locator('.bg-gradient-to-br, .bg-gradient-to-r').first();
      await expect(gradientElement).toBeVisible();
      console.log('✅ Gradient styling present');
    });

    test('should be responsive on smaller viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');

      // Should still show main elements
      await expect(page.locator('text=SAP Copilot Demo')).toBeVisible();
      console.log('✅ Responsive at 1024px width');
    });
  });
});
