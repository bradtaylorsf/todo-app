import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Clear any existing todos by reloading with clean localStorage
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Filter buttons', () => {
  async function addTodo(page, text) {
    await page.getByTestId('todo-input').fill(text);
    await page.getByTestId('add-button').click();
  }

  test('should add 3 todos, complete 1, and verify filter counts', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    // Complete the first todo
    const checkboxes = page.getByTestId('todo-checkbox');
    await checkboxes.first().click();

    // Verify count
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('should show only incomplete todos when Active filter is clicked', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    // Complete the first todo
    await page.getByTestId('todo-checkbox').first().click();

    // Click Active filter
    await page.getByTestId('filter-active').click();

    // Should show only 2 incomplete todos
    const items = page.getByTestId('todo-item');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0).getByTestId('todo-text')).toHaveText('Walk the dog');
    await expect(items.nth(1).getByTestId('todo-text')).toHaveText('Read a book');
  });

  test('should show only completed todos when Completed filter is clicked', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    // Complete the first todo
    await page.getByTestId('todo-checkbox').first().click();

    // Click Completed filter
    await page.getByTestId('filter-completed').click();

    // Should show only 1 completed todo
    const items = page.getByTestId('todo-item');
    await expect(items).toHaveCount(1);
    await expect(items.first().getByTestId('todo-text')).toHaveText('Buy groceries');
  });

  test('should show all todos when All filter is clicked', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    // Complete the first todo
    await page.getByTestId('todo-checkbox').first().click();

    // Switch to Active, then back to All
    await page.getByTestId('filter-active').click();
    await page.getByTestId('filter-all').click();

    // Should show all 3 todos
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
  });

  test('should highlight the active filter button', async ({ page }) => {
    // All should be active by default
    await expect(page.getByTestId('filter-all')).toHaveClass(/active/);

    // Click Active filter
    await page.getByTestId('filter-active').click();
    await expect(page.getByTestId('filter-active')).toHaveClass(/active/);
    await expect(page.getByTestId('filter-all')).not.toHaveClass(/active/);

    // Click Completed filter
    await page.getByTestId('filter-completed').click();
    await expect(page.getByTestId('filter-completed')).toHaveClass(/active/);
    await expect(page.getByTestId('filter-active')).not.toHaveClass(/active/);
  });

  test('should remove completed todos when Clear completed is clicked', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read a book');

    // Complete the first todo
    await page.getByTestId('todo-checkbox').first().click();

    // Clear completed should be visible
    await expect(page.getByTestId('clear-completed')).toBeVisible();

    // Click Clear completed
    await page.getByTestId('clear-completed').click();

    // Should have only 2 todos left
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('should hide Clear completed button when no completed todos exist', async ({ page }) => {
    await addTodo(page, 'Buy groceries');

    // No completed todos — button should not exist
    await expect(page.getByTestId('clear-completed')).toHaveCount(0);

    // Complete the todo
    await page.getByTestId('todo-checkbox').first().click();

    // Now it should be visible
    await expect(page.getByTestId('clear-completed')).toBeVisible();

    // Clear completed
    await page.getByTestId('clear-completed').click();

    // Button should be gone again
    await expect(page.getByTestId('clear-completed')).toHaveCount(0);
  });
});
