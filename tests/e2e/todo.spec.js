import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('add a todo and verify it appears', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Buy groceries');
  await page.getByTestId('add-button').click();

  const items = page.getByTestId('todo-item');
  await expect(items).toHaveCount(1);
  await expect(page.getByTestId('todo-text')).toHaveText('Buy groceries');
});

test('toggle a todo and verify strikethrough', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Buy groceries');
  await page.getByTestId('add-button').click();

  await page.getByTestId('todo-checkbox').click();

  const item = page.getByTestId('todo-item');
  await expect(item).toHaveClass(/completed/);
});

test('delete a todo and verify removal', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Buy groceries');
  await page.getByTestId('add-button').click();

  await page.getByTestId('todo-item').hover();
  await page.getByTestId('todo-delete').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('add multiple todos and verify count', async ({ page }) => {
  const todos = ['Buy groceries', 'Walk the dog', 'Write code'];
  for (const text of todos) {
    await page.getByTestId('todo-input').fill(text);
    await page.getByTestId('add-button').click();
  }

  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(page.getByTestId('todo-count')).toHaveText('3 items left');

  await page.getByTestId('todo-checkbox').first().click();
  await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
});

test('todos persist across page refresh', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Persistent todo');
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);

  await page.reload();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-text')).toHaveText('Persistent todo');
});
