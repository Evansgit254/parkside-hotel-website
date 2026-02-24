import { test, expect } from '@playwright/test';

test.describe('Parkside Villa Kitui E2E Tests', () => {

    test('Homepage loads correctly and has title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Parkside Villa Kitui/);
        await expect(page.getByText('Where Tradition Meets', { exact: false })).toBeVisible();
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

    test('Room cards are visible and "Book Room" button opens a modal', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            document.getElementById('accommodation')?.scrollIntoView();
        });
        const bookButtons = page.getByRole('button', { name: /Book Room/i });
        await expect(bookButtons.first()).toBeVisible({ timeout: 10000 });
        await bookButtons.first().click();
        await expect(page.getByText('Confirm Booking')).toBeVisible();
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
        await expect(page.getByPlaceholder('Your Name')).toBeVisible();
        // Button text is "Submit Inquiry" (not "Send Message")
        await expect(page.getByRole('button', { name: /Submit Inquiry/i })).toBeVisible();
    });

    test('Footer is visible with copyright text', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect(page.getByText('Parkside Villa Kitui. All Rights Reserved.', { exact: false })).toBeVisible();
    });

    test('Admin login page is accessible', async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page.getByText('Admin Access')).toBeVisible();
        await expect(page.getByPlaceholder('admin@parksidevilla.com')).toBeVisible();
    });
});
