const { chromium } = require('playwright');

(async () => {
    console.log("Launching browser...");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const errors = [];

    // Listen for all console logs
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });

    // Listen for uncaught exceptions
    page.on('pageerror', exception => {
        errors.push(`Uncaught Exception: ${exception}`);
    });

    console.log("Navigating to live site...");
    try {
        await page.goto('https://parkside-hotel-website-dnxk.vercel.app/', { waitUntil: 'networkidle' });

        // Wait a bit for client side rendering to complete/fail
        await page.waitForTimeout(3000);
    } catch (e) {
        console.error("Navigation error:", e);
    }

    if (errors.length > 0) {
        console.log("=== ERRORS DETECTED ===");
        errors.forEach(e => console.log(e));
    } else {
        console.log("No errors detected.");
    }

    await browser.close();
})();
