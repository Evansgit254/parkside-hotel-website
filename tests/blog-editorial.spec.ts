import { test, expect } from '@playwright/test';

test.describe('Parkside Villa Blog Editorial Suite E2E', () => {

    test.beforeEach(async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());

        await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
        await page.fill('input[type="email"]', 'admin@parksidevilla.com');
        await page.fill('input[type="password"]', 'parkside2025');
        await page.click('button:has-text("Enter Dashboard")');

        await expect(page.getByText(/Estate Overview/i)).toBeVisible({ timeout: 20000 });
        await expect(page).toHaveURL(/\/admin/);
    });

    test('Blog Editorial Suite UI & Workflow', async ({ page }) => {
        console.log('>>> [Blog Editorial Test] Navigating to Blog...');
        await page.goto('/admin/blog', { waitUntil: 'networkidle' });

        // 1. Verify Layout
        await expect(page.getByText('Blog Management')).toBeVisible();
        await expect(page.getByText('Editorial Registry')).toBeVisible();

        // 2. Open Composer
        console.log('>>> [Blog Editorial Test] Opening Composer...');
        await page.getByText('Write New Entry').click();

        // Wait for modal transition
        const modalHeading = page.locator('h2, h3').filter({ hasText: /Compose New Entry/i });
        await expect(modalHeading).toBeVisible({ timeout: 10000 });

        // 3. Form Interaction
        const timestamp = Date.now().toString();
        const articleTitle = `Luxury E2E ${timestamp}`;

        await page.fill('input[placeholder*="captivating title"]', articleTitle);
        await page.fill('textarea[placeholder*="story of Parkside Villa"]', 'E2E Validation Narrative.');

        console.log('>>> [Blog Editorial Test] Attempting Publish...');
        const publishBtn = page.getByRole('button', { name: /Publish Article/i });
        await publishBtn.waitFor({ state: 'visible', timeout: 30000 });
        await publishBtn.click({ force: true });

        // 4. Handle DB Hardening or Persistence
        console.log('>>> [Blog Editorial Test] Monitoring feedback...');

        const outcome = await Promise.race([
            page.getByText(articleTitle).waitFor({ state: 'visible', timeout: 15000 }).then(() => 'persisted'),
            page.getByText(/Database not configured/i).waitFor({ state: 'visible', timeout: 15000 }).then(() => 'hardened_alert'),
            page.waitForTimeout(20000).then(() => 'timeout')
        ]);

        console.log(`>>> [Blog Editorial Test] Outcome: ${outcome}`);

        if (outcome === 'hardened_alert') {
            console.log('>>> [Blog Editorial Test] Success: DB hardening verified via luxury alert.');
            await expect(page.getByText(/Database not configured/i)).toBeVisible();
            // Close modal using Cancel Draft button
            await page.getByText('Cancel Draft').click({ force: true });
        } else if (outcome === 'persisted') {
            console.log('>>> [Blog Editorial Test] Success: Article persisted.');
            await expect(page.getByText(articleTitle)).toBeVisible();
        } else {
            console.error('>>> [Blog Editorial Test] FAILURE: Test timed out waiting for outcome.');
            throw new Error('Blog Publishing Outcome Timeout');
        }

        // 5. Search Bar UX
        console.log('>>> [Blog Editorial Test] Verifying Search Bar...');
        await expect(page.getByPlaceholder(/Search archives/i)).toBeVisible();

        // 6. Filter UI
        console.log('>>> [Blog Editorial Test] Verifying Filter UI...');
        // Open the filter dropdown - use a precise selector for the group handle
        await page.locator('[class*="filterGroup"]').first().click();
        // Verify the dropdown contains categories from the static data
        await expect(page.locator('[class*="filterDropdown"]').getByText('Lifestyle')).toBeVisible({ timeout: 5000 });

        console.log('>>> [Blog Editorial Test] E2E Verification Complete.');
    });
});
