import { test, expect } from '@playwright/test';

test.describe('Parkside Villa Kitui E2E Tests', () => {

    test('Homepage loads correctly and has title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Parkside Villa Kitui/);
        // Matches the default Hero title
        await expect(page.getByText('Parkside Villa Kitui', { exact: false }).first()).toBeVisible();
    });

    test('Navigation links on homepage are visible', async ({ page }) => {
        await page.goto('/');
        // Scope to the <nav> element in the header to avoid matching footer links
        const nav = page.locator('nav').first();
        await expect(nav.getByRole('link', { name: 'Accommodation' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Conference' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Dining' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
    });

    test('Room cards are visible and "Reserve" button opens a modal', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            document.getElementById('accommodation')?.scrollIntoView();
        });
        const roomCard = page.getByTestId('room-card').first();
        await roomCard.hover();
        const reserveBtn = page.getByRole('button', { name: /Reserve/i }).first();
        await expect(reserveBtn).toBeAttached();
        await reserveBtn.click({ force: true });
        // Check for Step indicator instead of hardcoded title
        await expect(page.getByText('Step 1 of 3')).toBeVisible();
    });

    test('Dining page navigation and content', async ({ page }) => {
        await page.goto('/dining');
        await expect(page).toHaveURL(/\/dining/);
        await expect(page.getByText('Main Course').first()).toBeVisible();
        await expect(page.getByText('Grilled Beef Tenderloin')).toBeVisible();
    });

    test('Contact section form elements are present', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            document.getElementById('contact')?.scrollIntoView();
        });
        await page.waitForTimeout(500);
        await expect(page.getByText('Get In Touch')).toBeVisible();
        await expect(page.getByPlaceholder('Your preferred name')).toBeVisible();
        // Button text is "Send Enquiry" (refactored for CMS)
        await expect(page.getByRole('button', { name: /Send Enquiry/i })).toBeVisible();
    });

    test('Footer is visible with copyright text', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(page.getByText('Parkside Villa Kitui. All Rights Reserved.', { exact: false })).toBeVisible();
    });

    test('Admin login page is accessible', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.getByText('Secure Access')).toBeVisible();
        await expect(page.getByPlaceholder('admin@parksidevilla.com')).toBeVisible();
    });
});
