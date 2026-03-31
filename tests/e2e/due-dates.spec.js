import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('add a todo with a due date and verify it displays', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Pay bills');
  await page.getByTestId('due-date-input').fill('2026-05-15');
  await page.getByTestId('add-button').click();

  const dueDateEl = page.getByTestId('todo-due-date');
  await expect(dueDateEl).toBeVisible();
  await expect(dueDateEl).toContainText('May');
  await expect(dueDateEl).toContainText('15');
});

test('add a todo without a due date has no date element', async ({ page }) => {
  await page.getByTestId('todo-input').fill('No date task');
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('todo-due-date')).toHaveCount(0);
});

test('overdue todo gets overdue styling', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Overdue task');
  await page.getByTestId('due-date-input').fill('2020-01-01');
  await page.getByTestId('add-button').click();

  const todoItem = page.getByTestId('todo-item');
  await expect(todoItem).toHaveClass(/overdue/);
  await expect(todoItem).toHaveAttribute('data-overdue', '');
});

test('completing an overdue todo removes overdue styling', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Overdue task');
  await page.getByTestId('due-date-input').fill('2020-01-01');
  await page.getByTestId('add-button').click();

  const todoItem = page.getByTestId('todo-item');
  await expect(todoItem).toHaveClass(/overdue/);

  await page.getByTestId('todo-checkbox').click();
  await expect(todoItem).not.toHaveClass(/overdue/);
  await expect(todoItem).toHaveClass(/completed/);
});

test('due today shows Today text and due-today styling', async ({ page }) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  await page.getByTestId('todo-input').fill('Due today task');
  await page.getByTestId('due-date-input').fill(todayStr);
  await page.getByTestId('add-button').click();

  const todoItem = page.getByTestId('todo-item');
  await expect(todoItem).toHaveClass(/due-today/);

  const dueDateEl = page.getByTestId('todo-due-date');
  await expect(dueDateEl).toHaveText('Today');
});

test('due date persists after page reload', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Persistent task');
  await page.getByTestId('due-date-input').fill('2026-07-04');
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('todo-due-date')).toBeVisible();

  await page.reload();

  const dueDateEl = page.getByTestId('todo-due-date');
  await expect(dueDateEl).toBeVisible();
  await expect(dueDateEl).toContainText('Jul');
  await expect(dueDateEl).toContainText('4');
});
