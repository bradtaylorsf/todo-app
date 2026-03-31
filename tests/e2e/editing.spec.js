import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function addTodo(page, text) {
  await page.getByTestId('todo-input').fill(text);
  await page.getByTestId('add-button').click();
}

test('double-click to enter edit mode', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();

  const editInput = page.getByTestId('todo-edit');
  await expect(editInput).toBeVisible();
  await expect(editInput).toBeFocused();
  await expect(editInput).toHaveValue('Buy groceries');

  // Checkbox and delete button should be hidden
  await expect(page.getByTestId('todo-checkbox')).toHaveCount(0);
  await expect(page.getByTestId('todo-delete')).toHaveCount(0);
});

test('edit text and press Enter to save', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();

  const editInput = page.getByTestId('todo-edit');
  await editInput.fill('Buy organic groceries');
  await editInput.press('Enter');

  await expect(page.getByTestId('todo-text')).toHaveText('Buy organic groceries');
  await expect(page.getByTestId('todo-edit')).toHaveCount(0);
});

test('press Escape to cancel editing', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();

  const editInput = page.getByTestId('todo-edit');
  await editInput.fill('Something else');
  await editInput.press('Escape');

  await expect(page.getByTestId('todo-text')).toHaveText('Buy groceries');
  await expect(page.getByTestId('todo-edit')).toHaveCount(0);
});

test('edit to empty text deletes the todo', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();

  const editInput = page.getByTestId('todo-edit');
  await editInput.fill('');
  await editInput.press('Enter');

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('blur saves the edit', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();

  const editInput = page.getByTestId('todo-edit');
  await editInput.fill('Walk the dog');

  // Click outside to trigger blur
  await page.locator('h1').click();

  await expect(page.getByTestId('todo-text')).toHaveText('Walk the dog');
});

test('edited text persists across page refresh', async ({ page }) => {
  await addTodo(page, 'Buy groceries');

  await page.getByTestId('todo-text').dblclick();
  const editInput = page.getByTestId('todo-edit');
  await editInput.fill('Buy organic groceries');
  await editInput.press('Enter');

  await page.reload();

  await expect(page.getByTestId('todo-text')).toHaveText('Buy organic groceries');
});
