
import { test, expect } from '@playwright/test';

test.describe('Login and Register functionality', () => {
  const clientUrl = 'http://localhost:5173';
  const cleanerUrl = 'http://localhost:5173';

  test('should display an error message on failed login for client', async ({ page }) => {
    await page.goto(clientUrl);
    await page.waitForLoadState('networkidle');

    // Test login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'client1@example.com', { timeout: 10000 });
    await page.fill('input[type="password"]', 'password123', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });

    // Test register
    await page.goto(clientUrl);
    await page.waitForLoadState('networkidle');
    await page.click('text=Register', { timeout: 10000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'newuser', { timeout: 10000 });
    await page.fill('input[type="password"]', 'newpassword', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
  });

  test('should display an error message on failed login for cleaner', async ({ page }) => {
    await page.goto(cleanerUrl);
    await page.waitForLoadState('networkidle');

    // Test login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin', { timeout: 10000 });
    await page.fill('input[type="password"]', 'password', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });

    // Test register
    await page.goto(cleanerUrl);
    await page.waitForLoadState('networkidle');
    await page.click('text=Register', { timeout: 10000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'newuser', { timeout: 10000 });
    await page.fill('input[type="password"]', 'newpassword', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
  });
});
