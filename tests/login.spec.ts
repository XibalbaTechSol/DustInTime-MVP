
import { test, expect } from '@playwright/test';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'dustintime',
  password: 'password',
  port: 5432,
});

test.describe('Login and Register functionality', () => {
  const url = 'http://localhost:5173';

  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation']);
    await pool.query('DELETE FROM users');
  });

  test.afterAll(async () => {
    await pool.end();
  });

  test('should register a new user and skip onboarding', async ({ page }) => {
    await page.goto(url);

    // Test register
    await page.click('text=Register', { timeout: 10000 });
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', 'testuser123', { timeout: 10000 });
    await page.fill('input[name="email"]', 'testuser123@example.com', { timeout: 10000 });
    await page.fill('input[name="password"]', 'password', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Client Onboarding")')).toBeVisible({ timeout: 10000 });

    // Skip onboarding
    await page.click('text=Skip for now', { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Dashboard")')).toBeVisible({ timeout: 10000 });

    // Logout
    await page.locator('.avatar').click({ timeout: 10000 });
    await page.click('text=Logout', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Client Login")')).toBeVisible({ timeout: 10000 });
  });

  test('should log in an existing user and complete onboarding from profile', async ({ page }) => {
    // First, register a user to ensure one exists
    const hashedPassword = await bcrypt.hash('password', 8);
    await pool.query("INSERT INTO users (id, name, email, password, picture, role, address, propertyType, bedrooms, bathrooms, lat, lng, onboardingComplete) VALUES ('1', 'testuser123', 'testuser123@example.com', $1, 'picture', 'client', '', '', 1, 1, 0, 0, false)", [hashedPassword]);

    await page.goto(url);

    // Test login
    await page.fill('input[name="email"]', 'testuser123@example.com', { timeout: 10000 });
    await page.fill('input[name="password"]', 'password', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Dashboard")')).toBeVisible({ timeout: 10000 });

    // Go to profile and complete onboarding
    await page.locator('.avatar').click({ timeout: 10000 });
    await page.click('text=Profile', { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Profile")')).toBeVisible({ timeout: 10000 });
    await page.click('text=Complete Onboarding', { timeout: 10000 });
    await expect(page.locator('h1:has-text("Client Onboarding")')).toBeVisible({ timeout: 10000 });


    await page.fill('input[name="address"]', '123 Main St', { timeout: 10000 });
    await page.selectOption('select[name="propertyType"]', 'House', { timeout: 10000 });
    await page.fill('input[name="bedrooms"]', '3', { timeout: 10000 });
    await page.fill('input[name="bathrooms"]', '2', { timeout: 10000 });
    await page.click('button[type="submit"]', { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Dashboard")')).toBeVisible({ timeout: 10000 });
  });
});
