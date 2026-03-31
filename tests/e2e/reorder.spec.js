import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('drag first todo to last position and verify order', async ({ page }) => {
  const items = ['First', 'Second', 'Third'];
  for (const text of items) {
    await page.getByTestId('todo-input').fill(text);
    await page.getByTestId('add-button').click();
  }

  await expect(page.getByTestId('todo-item')).toHaveCount(3);

  const firstHandle = page.getByTestId('drag-handle').first();
  const lastItem = page.getByTestId('todo-item').last();

  await firstHandle.dragTo(lastItem);

  const texts = page.getByTestId('todo-text');
  await expect(texts.nth(0)).toHaveText('Second');
  await expect(texts.nth(1)).toHaveText('Third');
  await expect(texts.nth(2)).toHaveText('First');
});

test('reorder persists after page refresh', async ({ page }) => {
  const items = ['First', 'Second', 'Third'];
  for (const text of items) {
    await page.getByTestId('todo-input').fill(text);
    await page.getByTestId('add-button').click();
  }

  const firstHandle = page.getByTestId('drag-handle').first();
  const lastItem = page.getByTestId('todo-item').last();

  await firstHandle.dragTo(lastItem);

  await page.reload();

  const texts = page.getByTestId('todo-text');
  await expect(texts.nth(0)).toHaveText('Second');
  await expect(texts.nth(1)).toHaveText('Third');
  await expect(texts.nth(2)).toHaveText('First');
});
