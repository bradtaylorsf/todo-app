import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('add a todo and verify it appears', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Buy groceries');
  await page.getByTestId('add-button').click();

  const item = page.getByTestId('todo-item');
  await expect(item).toHaveCount(1);
  await expect(item.getByTestId('todo-text')).toHaveText('Buy groceries');
});

test('empty input does not create a todo', async ({ page }) => {
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('input clears after adding a todo', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Test todo');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-input')).toHaveValue('');
});

test('toggle a todo and verify strikethrough', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Toggle me');
  await page.getByTestId('add-button').click();

  const item = page.getByTestId('todo-item');
  await item.getByTestId('todo-checkbox').click();

  await expect(item).toHaveClass(/completed/);
  await expect(item.getByTestId('todo-text')).toHaveCSS('text-decoration-line', 'line-through');
});

test('delete a todo and verify it is removed', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Delete me');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);

  await page.getByTestId('todo-item').hover();
  await page.getByTestId('todo-delete').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('add multiple todos and verify count', async ({ page }) => {
  const todos = ['First', 'Second', 'Third'];
  for (const text of todos) {
    await page.getByTestId('todo-input').fill(text);
    await page.getByTestId('add-button').click();
  }

  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(page.getByTestId('todo-count')).toHaveText('3 items left');

  // Toggle one and verify count updates
  await page.getByTestId('todo-item').first().getByTestId('todo-checkbox').click();
  await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
});

test('singular count for one item', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Only one');
  await page.getByTestId('add-button').click();
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
});

test('todos persist across page refresh', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Persistent todo');
  await page.getByTestId('add-button').click();

  await page.reload();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-text')).toHaveText('Persistent todo');
});
