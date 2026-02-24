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
        await page.fill('input[placeholder="e.g. $150"]', '$999');
        await page.fill('textarea[placeholder="Describe the room\'s unique features..."]', 'Test description');
        await page.fill('input[placeholder="https://images.unsplash.com/..."]', 'https://images.unsplash.com/photo-1590490360182-c33d57733427');

        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText(roomName)).toBeVisible({ timeout: 15000 });

        const roomRow = page.locator('div[class*="listItem"]').filter({ hasText: roomName });
        await roomRow.getByRole('button', { name: 'Edit' }).click();
        await page.fill('input[placeholder="e.g. $150"]', '$888');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(roomRow.getByText('$888')).toBeVisible({ timeout: 10000 });

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
        await page.fill('input[placeholder="e.g. $45"]', '$15');
        await page.getByRole('button', { name: 'Save Changes' }).click();


        await expect(itemRow.getByText('$15')).toBeVisible({ timeout: 10000 });

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

        const facRow = page.locator('div[class*="listItem"]').filter({ hasText: facTitle });
        await facRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText(facTitle)).not.toBeVisible({ timeout: 10000 });
        console.log('>>> [Facilities Test] SUCCESS.');
    });

    test('Leads Management', async ({ page }) => {
        console.log('>>> [Leads Test] Starting...');
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /Book Room/i }).first().click();

        const timestamp = Date.now().toString();
        const testName = `Lead Test ${timestamp}`;

        // Fill required dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        await page.locator('input[type="date"]').first().fill(today);
        await page.locator('input[type="date"]').last().fill(tomorrow);

        await page.fill('input[placeholder="John Doe"]', testName);
        await page.fill('input[placeholder="john@example.com"]', `test-${timestamp}@example.com`);
        await page.fill('input[placeholder="+254 700 000000"]', '123456789');
        await page.click('button:has-text("Confirm Booking")');

        // Wait for success message to appear on public site
        await expect(page.getByText(/Booking Confirmed/i)).toBeVisible({ timeout: 30000 });

        await page.goto('/admin/leads', { waitUntil: 'networkidle' });

        // If we got logged out, log back in
        if (page.url().includes('/login')) {
            console.log('>>> [Leads Test] Redirected to login, re-logging in...');
            await page.fill('input[type="email"]', 'admin@parksidevilla.com');
            await page.fill('input[type="password"]', 'parkside2025');
            await page.click('button:has-text("Enter Dashboard")');
            await expect(page).toHaveURL(/\/admin\/leads/);
        }

        await page.waitForTimeout(5000); // Give it more time for FS sync
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.getByText(testName)).toBeVisible({ timeout: 45000 });

        const leadRow = page.locator('div[class*="listItem"]').filter({ hasText: testName });
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
        const whatsappInput = page.locator('input[placeholder="e.g. 254700000000"]');
        await whatsappInput.fill(newWhatsApp);
        await page.getByRole('button', { name: /Commit Global Update/i }).click();

        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(whatsappInput).toHaveValue(newWhatsApp, { timeout: 15000 });

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

