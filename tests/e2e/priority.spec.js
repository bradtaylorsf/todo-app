import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('default priority is medium with orange indicator', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Default priority todo');
  await page.getByTestId('add-button').click();

  const select = page.getByTestId('priority-select');
  await expect(select).toHaveValue('medium');

  const indicator = page.getByTestId('priority-indicator');
  await expect(indicator).toHaveClass(/priority-medium/);
});

test('add todo with high priority shows red indicator', async ({ page }) => {
  await page.getByTestId('priority-select').selectOption('high');
  await page.getByTestId('todo-input').fill('Urgent task');
  await page.getByTestId('add-button').click();

  const indicator = page.getByTestId('priority-indicator');
  await expect(indicator).toHaveClass(/priority-high/);
});

test('add todo with low priority shows blue indicator', async ({ page }) => {
  await page.getByTestId('priority-select').selectOption('low');
  await page.getByTestId('todo-input').fill('Someday task');
  await page.getByTestId('add-button').click();

  const indicator = page.getByTestId('priority-indicator');
  await expect(indicator).toHaveClass(/priority-low/);
});

test('sort by priority orders high first', async ({ page }) => {
  await page.getByTestId('priority-select').selectOption('low');
  await page.getByTestId('todo-input').fill('Low task');
  await page.getByTestId('add-button').click();

  await page.getByTestId('priority-select').selectOption('high');
  await page.getByTestId('todo-input').fill('High task');
  await page.getByTestId('add-button').click();

  await page.getByTestId('priority-select').selectOption('medium');
  await page.getByTestId('todo-input').fill('Medium task');
  await page.getByTestId('add-button').click();

  await page.getByTestId('sort-priority').click();

  const texts = page.getByTestId('todo-text');
  await expect(texts.nth(0)).toHaveText('High task');
  await expect(texts.nth(1)).toHaveText('Medium task');
  await expect(texts.nth(2)).toHaveText('Low task');
});

test('priority persists after reload', async ({ page }) => {
  await page.getByTestId('priority-select').selectOption('high');
  await page.getByTestId('todo-input').fill('Persistent high');
  await page.getByTestId('add-button').click();

  await page.reload();

  const indicator = page.getByTestId('priority-indicator');
  await expect(indicator).toHaveClass(/priority-high/);
});
