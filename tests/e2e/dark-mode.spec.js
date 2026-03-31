import { test, expect } from '@playwright/test';

test.describe('dark mode toggle', () => {
  test.use({ colorScheme: 'dark' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('toggle button is visible', async ({ page }) => {
    const toggle = page.locator('[data-testid="theme-toggle"]');
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle switches theme', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.click('[data-testid="theme-toggle"]');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.click('[data-testid="theme-toggle"]');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('theme persists across page refresh', async ({ page }) => {
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('icon changes between sun and moon', async ({ page }) => {
    const toggle = page.locator('[data-testid="theme-toggle"]');

    // Dark mode shows sun icon (to switch to light)
    await expect(toggle).toHaveText('☀️');

    await toggle.click();

    // Light mode shows moon icon (to switch to dark)
    await expect(toggle).toHaveText('🌙');
  });

  test('key elements visible in dark mode', async ({ page }) => {
    await expect(page.locator('[data-testid="todo-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
  });

  test('key elements visible in light mode', async ({ page }) => {
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await expect(page.locator('[data-testid="todo-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible();
  });
});

test.describe('system preference detection', () => {
  test('detects light system preference', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await context.close();
  });

  test('detects dark system preference', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });
});
