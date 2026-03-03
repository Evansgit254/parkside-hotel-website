import { test, expect } from '@playwright/test';

test.describe('Parkside Villa Admin CRUD Operations', () => {

    test.beforeEach(async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());
        await page.goto('/admin/login', { waitUntil: 'networkidle' });
        await page.fill('input[type="email"]', 'admin@parksidevilla.com');
        await page.fill('input[type="password"]', 'parkside2025');
        await page.click('button[type="submit"]');
        // Wait for dashboard and ensure we are on the admin page
        await expect(page).toHaveURL(/\/admin/);
        await expect(page.getByText(/Estate Overview/i)).toBeVisible({ timeout: 60000 });
    });

    test('Rooms CRUD', async ({ page }) => {
        console.log('>>> [Rooms Test] Starting...');
        await page.goto('/admin/rooms', { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { name: 'Accommodation' })).toBeVisible({ timeout: 10000 });

        const timestamp = Date.now().toString();
        const roomName = `Test Room ${timestamp}`;

        await page.getByRole('button', { name: /New Room/i }).click();
        await page.fill('input[placeholder="e.g. Executive Suite"]', roomName);
        await page.fill('input[placeholder="e.g. $150"]', '999');
        await page.fill('textarea[placeholder="Describe the room\'s unique features..."]', 'Test description');
        await page.fill('input[placeholder="https://images.unsplash.com/..."]', 'https://images.unsplash.com/photo-1590490360182-c33d57733427');

        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('KES 999')).toBeVisible({ timeout: 15000 });

        const roomRow = page.locator('div[class*="tableRow"]').filter({ hasText: roomName });
        await roomRow.getByRole('button', { name: 'Edit' }).click();
        await page.fill('input[placeholder="e.g. $150"]', '888');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(roomRow.getByText('KES 888')).toBeVisible({ timeout: 10000 });

        await roomRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(roomName)).not.toBeVisible({ timeout: 20000 });
        console.log('>>> [Rooms Test] SUCCESS.');
    });

    test('Dining CRUD', async ({ page }) => {
        console.log('>>> [Dining Test] Starting...');
        await page.goto('/admin/dining', { waitUntil: 'domcontentloaded' });
        await expect(page.getByText('Dining & Cuisine')).toBeVisible({ timeout: 10000 });

        const catName = `Test Category ${Date.now()}`;
        await page.getByRole('button', { name: /New Category/i }).click();
        await page.fill('input[placeholder="e.g. Main Course, Wine List..."]', catName);
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByRole('heading', { name: catName, exact: true })).toBeVisible({ timeout: 15000 });

        const itemName = `Test Item ${Date.now()}`;
        const catSection = page.locator('div[class*="card"]').filter({ has: page.getByRole('heading', { name: catName, exact: true }) });
        await catSection.getByText(/Add new dish to/i).click();
        await page.fill('input[placeholder="e.g. Grilled Ribeye Steak"]', itemName);
        await page.fill('input[placeholder="e.g. $45"]', '$10');
        await page.fill('textarea[placeholder="Key ingredients, preparation method..."]', 'Test item description');
        await page.getByRole('button', { name: 'Save Changes' }).click();

        await expect(catSection.getByText(itemName)).toBeVisible({ timeout: 15000 });

        // Edit
        const itemRow = catSection.locator('div[class*="listItem"]').filter({ hasText: itemName });
        await itemRow.getByRole('button', { name: 'Edit' }).click();
        await page.fill('input[placeholder="e.g. $45"]', '15');
        await page.getByRole('button', { name: 'Save Changes' }).click();


        await expect(itemRow.getByText('KES 15')).toBeVisible({ timeout: 10000 });

        // Delete
        await itemRow.getByRole('button', { name: 'Delete' }).click();
        await expect(catSection.getByText(itemName)).not.toBeVisible({ timeout: 10000 });

        // Delete Category
        await catSection.getByRole('button', { name: 'Delete' }).first().click();
        await expect(page.getByRole('heading', { name: catName, exact: true })).not.toBeVisible({ timeout: 10000 });
        console.log('>>> [Dining Test] SUCCESS.');
    });

    test('Facilities CRUD', async ({ page }) => {
        await page.goto('/admin/facilities', { waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { name: 'Facilities' })).toBeVisible({ timeout: 10000 });

        const facTitle = `Test Facility ${Date.now()}`;
        await page.getByRole('button', { name: /New Facility/i }).click();
        await page.fill('input[placeholder="e.g. Infinity Lounge"]', facTitle);
        await page.fill('textarea[placeholder="What makes this facility special?..."]', 'Test description');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText(facTitle)).toBeVisible({ timeout: 15000 });

        const facRow = page.locator('div[class*="tableRow"]').filter({ hasText: facTitle });
        await facRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(facTitle)).not.toBeVisible({ timeout: 10000 });
        console.log('>>> [Facilities Test] SUCCESS.');
    });

    test('Leads Management', async ({ page }) => {
        test.setTimeout(300000); // This test may take up to 5 minutes due to environment latency
        console.log('>>> [Leads Test] Starting...');

        // Capture browser console logs
        page.on('console', msg => {
            if (msg.text().startsWith('>>>')) {
                console.log(`[Browser] ${msg.text()}`);
            }
        });

        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Wait for rooms to load and "Reserve" button to appear
        const reserveBtn = page.getByRole('button', { name: /Reserve/i }).first();
        await reserveBtn.waitFor({ state: 'visible', timeout: 30000 });
        await reserveBtn.click();

        // Wait for modal to be visible
        const modal = page.getByTestId('booking-modal');
        await modal.waitFor({ state: 'visible', timeout: 60000 });
        await page.waitForTimeout(2000); // Wait for transition animation

        const timestamp = Date.now().toString();
        const testName = `Lead Test ${timestamp}`;

        // Fill required dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        await page.locator('input[type="date"]').first().fill(today);
        await page.locator('input[type="date"]').last().fill(tomorrow);

        // Step 1 -> Step 2
        const step1Continue = page.getByTestId('booking-step-1-continue');
        await step1Continue.waitFor({ state: 'visible', timeout: 60000 });
        await step1Continue.click({ force: true });
        await page.waitForTimeout(2000); // Wait for animation

        await page.fill('input[placeholder="Your full name"]', testName);
        await page.fill('input[placeholder="your@email.com"]', `test-${timestamp}@example.com`);
        await page.fill('input[placeholder="+254 700 000 000"]', '123456789');

        // Step 2 -> Step 3
        console.log('>>> [Leads Test] Clicking Continue (Step 2)...');
        const step2Continue = page.getByTestId('booking-step-2-continue');
        await step2Continue.waitFor({ state: 'visible', timeout: 60000 });
        await step2Continue.click({ force: true });
        await page.waitForTimeout(2000); // Wait for animation

        // Step 3 (Payment) -> Complete
        console.log('>>> [Leads Test] Entering Step 3...');
        const step3Container = page.getByTestId('booking-step-3-method');
        await step3Container.waitFor({ state: 'visible', timeout: 60000 });

        console.log('>>> [Leads Test] Selecting Payment Method...');
        const mpesaOption = page.getByTestId('payment-option-mpesa');
        await mpesaOption.waitFor({ state: 'visible', timeout: 60000 });
        await mpesaOption.click({ force: true }); // Select M-Pesa

        console.log('>>> [Leads Test] Clicking Proceed to Pay...');
        const proceedBtn = page.getByRole('button', { name: /Proceed to Pay/i });
        await proceedBtn.waitFor({ state: 'visible', timeout: 60000 });
        await proceedBtn.click({ force: true });
        await page.waitForTimeout(3000); // Wait for transition

        // Wait for success message to appear on public site
        console.log('>>> [Leads Test] Waiting for Confirmation...');
        await expect(page.getByText(/Reservation Confirmed/i)).toBeVisible({ timeout: 60000 });

        await page.goto('/admin/leads', { waitUntil: 'domcontentloaded' });

        // If we got logged out, log back in
        if (page.url().includes('/login')) {
            console.log('>>> [Leads Test] Redirected to login, re-logging in...');
            await page.fill('input[type="email"]', 'admin@parksidevilla.com');
            await page.fill('input[type="password"]', 'parkside2025');
            await page.click('button:has-text("Enter Dashboard")');
            await expect(page).toHaveURL(/\/admin\/leads/);
        }

        // Poll the admin leads page until the lead appears (handles client-side fetch delay)
        const deadline = Date.now() + 120000;
        let found = false;
        while (!found && Date.now() < deadline) {
            await page.waitForTimeout(2000);
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(1500);
            const count = await page.getByText(testName).count();
            if (count > 0) { found = true; break; }
        }
        await expect(page.getByText(testName)).toBeVisible({ timeout: 15000 });


        const leadRow = page.locator('div[class*="tableRow"]').filter({ hasText: testName });
        await leadRow.locator('select').selectOption('Confirmed');
        await expect(leadRow.locator('select')).toHaveValue('Confirmed', { timeout: 15000 });

        await leadRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(testName)).not.toBeVisible({ timeout: 15000 });
        console.log('>>> [Leads Test] SUCCESS.');
    });

    test('Settings Page', async ({ page }) => {
        console.log('>>> [Settings Test] Starting...');
        await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

        const newWhatsApp = `254${Math.floor(Math.random() * 1000000000)}`;
        console.log('>>> [Settings Test] Entering WhatsApp...');
        const whatsappInput = page.locator('input[placeholder="e.g. 254700000000"]');
        await whatsappInput.fill(newWhatsApp);
        await page.getByRole('button', { name: /Commit Global Update/i }).click({ force: true });

        // Extra time for FS sync on high latency environments
        await page.waitForTimeout(5000);
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Retry logic for value check if needed, but 8s + networkidle should be enough
        await expect(whatsappInput).toHaveValue(newWhatsApp, { timeout: 20000 });

        const testImageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb';
        await page.fill('input[placeholder="Entrust a new high-resolution image URL..."]', testImageUrl);
        await page.getByRole('button', { name: /Add Ambiance/i }).click();

        const imageRow = page.locator('div').filter({ has: page.locator('img') }).filter({ hasText: testImageUrl.split('/').pop()! }).last();
        await expect(imageRow).toBeVisible({ timeout: 10000 });

        await imageRow.getByRole('button', { name: 'Remove Image' }).click();
        await expect(page.getByText(testImageUrl)).not.toBeVisible({ timeout: 10000 });
        console.log('>>> [Settings Test] SUCCESS.');
    });
});

