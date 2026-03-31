import { test, expect } from '@playwright/test';

test.describe('Keyboard shortcuts and accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('/ focuses the input', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.getByTestId('todo-input')).toBeFocused();
  });

  test('1, 2, 3 switch filters', async ({ page }) => {
    // Add a todo and complete it so filters have something to show
    await page.getByTestId('todo-input').fill('Test todo');
    await page.getByTestId('add-button').click();
    await page.getByTestId('todo-checkbox').click();

    // Click somewhere neutral to blur input
    await page.locator('h1').click();

    await page.keyboard.press('2'); // Active
    await expect(page.getByTestId('filter-active')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'false');

    await page.keyboard.press('3'); // Completed
    await expect(page.getByTestId('filter-completed')).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('1'); // All
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
  });

  test('filter shortcuts ignored when input focused', async ({ page }) => {
    await page.getByTestId('todo-input').focus();
    await page.keyboard.press('2');
    // Filter should NOT have changed
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
  });

  test('Tab navigates through interactive elements', async ({ page }) => {
    // Add a todo
    await page.getByTestId('todo-input').fill('Buy milk');
    await page.getByTestId('add-button').click();

    // Start from the add button (reliable starting point)
    await page.getByTestId('add-button').focus();

    // Tab from add button → should reach the checkbox
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('todo-checkbox')).toBeFocused();

    // Verify checkbox is keyboard-accessible
    const checkbox = page.getByTestId('todo-checkbox');
    await expect(checkbox).toHaveAttribute('aria-label', /Buy milk/);
  });

  test('checkboxes have aria-labels', async ({ page }) => {
    await page.getByTestId('todo-input').fill('Buy milk');
    await page.getByTestId('add-button').click();

    const checkbox = page.getByTestId('todo-checkbox');
    await expect(checkbox).toHaveAttribute('aria-label', 'Mark Buy milk as complete');
  });

  test('delete buttons have aria-labels', async ({ page }) => {
    await page.getByTestId('todo-input').fill('Buy milk');
    await page.getByTestId('add-button').click();

    const deleteBtn = page.getByTestId('todo-delete');
    await expect(deleteBtn).toHaveAttribute('aria-label', 'Delete Buy milk');
  });

  test('filter buttons have aria-pressed', async ({ page }) => {
    await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('filter-active')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('filter-completed')).toHaveAttribute('aria-pressed', 'false');
  });

  test('todo list has role="list" and items have role="listitem"', async ({ page }) => {
    await page.getByTestId('todo-input').fill('Test item');
    await page.getByTestId('add-button').click();

    await expect(page.getByTestId('todo-list')).toHaveAttribute('role', 'list');
    await expect(page.getByTestId('todo-item')).toHaveAttribute('role', 'listitem');
  });

  test('live region announces todo changes', async ({ page }) => {
    // Add a todo
    await page.getByTestId('todo-input').fill('Test todo');
    await page.getByTestId('add-button').click();
    await expect(page.locator('#live-region')).toHaveText('Todo added');

    // Complete it
    await page.getByTestId('todo-checkbox').click();
    await expect(page.locator('#live-region')).toHaveText('Todo completed');

    // Delete it
    await page.getByTestId('todo-delete').click();
    await expect(page.locator('#live-region')).toHaveText('Todo deleted');
  });

  test('? button opens shortcuts overlay', async ({ page }) => {
    await expect(page.getByTestId('shortcuts-help')).not.toBeVisible();
    await page.getByTestId('shortcuts-trigger').click();
    await expect(page.getByTestId('shortcuts-help')).toBeVisible();
  });

  test('Escape closes shortcuts overlay', async ({ page }) => {
    await page.getByTestId('shortcuts-trigger').click();
    await expect(page.getByTestId('shortcuts-help')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('shortcuts-help')).not.toBeVisible();
  });

  test('? key toggles shortcuts overlay', async ({ page }) => {
    await page.locator('h1').click(); // Ensure no input focused
    await page.keyboard.press('?');
    await expect(page.getByTestId('shortcuts-help')).toBeVisible();
    await page.keyboard.press('?');
    await expect(page.getByTestId('shortcuts-help')).not.toBeVisible();
  });

  test('delete button visible on focus', async ({ page }) => {
    await page.getByTestId('todo-input').fill('Test');
    await page.getByTestId('add-button').click();

    const deleteBtn = page.getByTestId('todo-delete');
    await deleteBtn.focus();
    await expect(deleteBtn).toBeVisible();
  });
});
