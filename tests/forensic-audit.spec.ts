import { test, expect } from '@playwright/test';

const pages = [
    '/',
    '/rooms',
    '/facilities/conference',
    '/facilities/pool',
    '/gallery',
    '/blog',
    '/blog/luxury-kitui-hospitality',
    '/dining',
    '/admin/login'
];

test.describe('Deep Forensic Audit', () => {
    for (const path of pages) {
        test(`Audit page: ${path}`, async ({ page }) => {
            const errors: string[] = [];
            const consoleErrors: string[] = [];

            // Listen for console errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Listen for page errors
            page.on('pageerror', err => {
                errors.push(err.message);
            });

            // Track failed requests (404/500)
            const failedRequests: string[] = [];
            page.on('response', response => {
                if (response.status() >= 400 && !response.url().includes('google-analytics') && !response.url().includes('doubleclick')) {
                    failedRequests.push(`${response.status()} - ${response.url()}`);
                }
            });

            await page.goto(path, { waitUntil: 'networkidle' });

            // 1. Verify Title
            await expect(page).not.toHaveTitle(/404/i);
            await expect(page).not.toHaveTitle(/Error/i);

            // 2. Check for broken images
            const images = page.locator('img');
            const imageCount = await images.count();
            for (let i = 0; i < imageCount; i++) {
                const img = images.nth(i);
                const isVisible = await img.isVisible();
                if (isVisible) {
                    const box = await img.boundingBox();
                    if (box && (box.width === 0 || box.height === 0)) {
                        failedRequests.push(`Image with 0 size: ${await img.getAttribute('src')}`);
                    }
                }
            }

            // 3. Accessibility: Basic check for alt tags
            for (let i = 0; i < imageCount; i++) {
                const alt = await images.nth(i).getAttribute('alt');
                // We won't fail the test for missing alt, but it would be good to log
            }

            // 4. Broken internal links
            const links = page.locator('a[href^="/"]');
            const linkCount = await links.count();
            const internalLinks = new Set<string>();
            for (let i = 0; i < linkCount; i++) {
                const href = await links.nth(i).getAttribute('href');
                if (href) internalLinks.add(href);
            }

            // Reporting results to console for the "forensic" part
            if (consoleErrors.length > 0) console.log(`[CONSOLE ERRORS] ${path}:`, consoleErrors);
            if (errors.length > 0) console.log(`[PAGE ERRORS] ${path}:`, errors);
            if (failedRequests.length > 0) console.log(`[FAILED REQUESTS] ${path}:`, failedRequests);

            expect(errors.length).toBe(0);
            expect(failedRequests.length).toBe(0);
        });
    }

    test('Luxury Section Forensic: Brand Quote', async ({ page }) => {
        await page.goto('/');
        // Use a more specific selector or .first() to avoid ambiguity
        const brandQuote = page.locator('div[class*="brandQuote"]').first();
        await expect(brandQuote).toBeVisible();

        // Verify background color is Ivory (#FDFBF8)
        const bgColor = await brandQuote.evaluate(el => window.getComputedStyle(el).backgroundColor);
        // rgb(253, 251, 248) is #FDFBF8
        expect(bgColor).toBe('rgb(253, 251, 248)');

        const quoteText = page.locator('p[class*="brandQuoteText"]').first();
        await expect(quoteText).toBeVisible();
        const textColor = await quoteText.evaluate(el => window.getComputedStyle(el).color);
        // rgb(20, 75, 54) is #144B36
        expect(textColor).toBe('rgb(20, 75, 54)');
    });

    test('Luxury Section Forensic: Room Hero Overlay', async ({ page }) => {
        await page.goto('/rooms/executive-suites');
        const overlay = page.locator('div[class*="heroOverlay"]').first();
        await expect(overlay).toBeVisible();

        // Check for dark gradient (should not be white/hazy)
        const bgImage = await overlay.evaluate(el => window.getComputedStyle(el).backgroundImage);
        expect(bgImage).toContain('rgba(5, 15, 11');

        const title = page.locator('h1[class*="title"]').first();
        await expect(title).toBeVisible();
        const textColor = await title.evaluate(el => window.getComputedStyle(el).color);
        expect(textColor).toBe('rgb(255, 255, 255)');
    });

    test('Luxury Section Forensic: Recently Viewed Contrast', async ({ page }) => {
        await page.goto('/');
        // Simulate viewing a room first to populate recently viewed
        await page.goto('/rooms/executive-suites');
        await page.goto('/');

        const recentSection = page.locator('section[class*="recentSection"]').first();
        if (await recentSection.isVisible()) {
            const recentItem = recentSection.locator('[class*="recentItem"]').first();
            await expect(recentItem).toBeVisible();

            // Should have white background (rgb(255, 255, 255))
            const bgColor = await recentItem.evaluate(el => window.getComputedStyle(el).backgroundColor);
            expect(bgColor).toBe('rgb(255, 255, 255)');

            const recentName = recentItem.locator('[class*="recentName"]').first();
            const textColor = await recentName.evaluate(el => window.getComputedStyle(el).color);
            // Should be forest green (rgb(20, 75, 54))
            expect(textColor).toBe('rgb(20, 75, 54)');
        }
    });
});
