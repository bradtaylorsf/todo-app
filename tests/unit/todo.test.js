import { describe, it, expect } from 'vitest';
import {
  createTodo,
  toggleTodo,
  removeTodo,
  editTodo,
  reorderTodos,
  filterTodos,
  countActive,
  countCompleted,
  isOverdue,
  isDueToday,
  sortByDueDate,
  setPriority,
  sortByPriority,
} from '../../src/todo.js';

function makeTodo(overrides = {}) {
  return {
    id: 'test-1',
    text: 'Test todo',
    completed: false,
    createdAt: 1000,
    dueDate: null,
    ...overrides,
  };
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pastDateString() {
  return '2020-01-01';
}

function futureDateString() {
  return '2099-12-31';
}

describe('createTodo', () => {
  it('creates a todo with correct shape', () => {
    const todo = createTodo('Buy milk');
    expect(todo).toMatchObject({
      text: 'Buy milk',
      completed: false,
    });
    expect(typeof todo.id).toBe('string');
    expect(todo.id.length).toBeGreaterThan(0);
    expect(typeof todo.createdAt).toBe('number');
  });

  it('trims whitespace from text', () => {
    const todo = createTodo('  Buy milk  ');
    expect(todo.text).toBe('Buy milk');
  });

  it('throws on empty text', () => {
    expect(() => createTodo('')).toThrow('Todo text cannot be empty');
  });

  it('throws on whitespace-only text', () => {
    expect(() => createTodo('   ')).toThrow('Todo text cannot be empty');
  });

  it('generates unique IDs', () => {
    const a = createTodo('A');
    const b = createTodo('B');
    expect(a.id).not.toBe(b.id);
  });
});

describe('toggleTodo', () => {
  it('toggles completed from false to true', () => {
    const todos = [makeTodo()];
    const result = toggleTodo(todos, 'test-1');
    expect(result[0].completed).toBe(true);
  });

  it('toggles completed from true to false', () => {
    const todos = [makeTodo({ completed: true })];
    const result = toggleTodo(todos, 'test-1');
    expect(result[0].completed).toBe(false);
  });

  it('does not mutate the original array', () => {
    const todos = Object.freeze([Object.freeze(makeTodo())]);
    const result = toggleTodo(todos, 'test-1');
    expect(result).not.toBe(todos);
    expect(todos[0].completed).toBe(false);
  });

  it('leaves other todos unchanged', () => {
    const todos = [makeTodo(), makeTodo({ id: 'test-2', text: 'Other' })];
    const result = toggleTodo(todos, 'test-1');
    expect(result[1]).toBe(todos[1]);
  });

  it('returns new array when ID not found', () => {
    const todos = [makeTodo()];
    const result = toggleTodo(todos, 'nonexistent');
    expect(result).not.toBe(todos);
    expect(result).toEqual(todos);
  });
});

describe('removeTodo', () => {
  it('removes the correct todo', () => {
    const todos = [makeTodo(), makeTodo({ id: 'test-2' })];
    const result = removeTodo(todos, 'test-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-2');
  });

  it('does not mutate the original array', () => {
    const todos = Object.freeze([makeTodo()]);
    const result = removeTodo(todos, 'test-1');
    expect(todos).toHaveLength(1);
    expect(result).toHaveLength(0);
  });

  it('returns same-length array when ID not found', () => {
    const todos = [makeTodo()];
    const result = removeTodo(todos, 'nonexistent');
    expect(result).toHaveLength(1);
  });
});

describe('editTodo', () => {
  it('updates text for matching ID', () => {
    const todos = [makeTodo()];
    const result = editTodo(todos, 'test-1', 'Updated');
    expect(result[0].text).toBe('Updated');
  });

  it('trims new text', () => {
    const todos = [makeTodo()];
    const result = editTodo(todos, 'test-1', '  Updated  ');
    expect(result[0].text).toBe('Updated');
  });

  it('throws on empty new text', () => {
    const todos = [makeTodo()];
    expect(() => editTodo(todos, 'test-1', '')).toThrow('Todo text cannot be empty');
  });

  it('does not mutate the original array or todo', () => {
    const todos = Object.freeze([Object.freeze(makeTodo())]);
    const result = editTodo(todos, 'test-1', 'Updated');
    expect(result).not.toBe(todos);
    expect(result[0]).not.toBe(todos[0]);
    expect(todos[0].text).toBe('Test todo');
  });

  it('leaves other todos unchanged', () => {
    const todos = [makeTodo(), makeTodo({ id: 'test-2' })];
    const result = editTodo(todos, 'test-1', 'Updated');
    expect(result[1]).toBe(todos[1]);
  });
});

describe('reorderTodos', () => {
  it('moves item from first to last position', () => {
    const todos = [
      makeTodo({ id: '1', text: 'A' }),
      makeTodo({ id: '2', text: 'B' }),
      makeTodo({ id: '3', text: 'C' }),
    ];
    const result = reorderTodos(todos, 0, 2);
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('moves item from last to first position', () => {
    const todos = [
      makeTodo({ id: '1', text: 'A' }),
      makeTodo({ id: '2', text: 'B' }),
      makeTodo({ id: '3', text: 'C' }),
    ];
    const result = reorderTodos(todos, 2, 0);
    expect(result.map(t => t.id)).toEqual(['3', '1', '2']);
  });

  it('does not mutate the original array', () => {
    const todos = Object.freeze([
      makeTodo({ id: '1' }),
      makeTodo({ id: '2' }),
      makeTodo({ id: '3' }),
    ]);
    const result = reorderTodos(todos, 0, 2);
    expect(result).not.toBe(todos);
    expect(todos.map(t => t.id)).toEqual(['1', '2', '3']);
  });

  it('handles same index (no-op)', () => {
    const todos = [
      makeTodo({ id: '1' }),
      makeTodo({ id: '2' }),
    ];
    const result = reorderTodos(todos, 1, 1);
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });

  it('handles adjacent swap', () => {
    const todos = [
      makeTodo({ id: '1', text: 'A' }),
      makeTodo({ id: '2', text: 'B' }),
    ];
    const result = reorderTodos(todos, 0, 1);
    expect(result.map(t => t.id)).toEqual(['2', '1']);
  });
});

describe('filterTodos', () => {
  const todos = [
    makeTodo({ id: '1', completed: false }),
    makeTodo({ id: '2', completed: true }),
    makeTodo({ id: '3', completed: false }),
  ];

  it('returns all todos for "all"', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('returns only active todos for "active"', () => {
    const result = filterTodos(todos, 'active');
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('returns only completed todos for "completed"', () => {
    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].completed).toBe(true);
  });

  it('returns a new array, not the same reference', () => {
    expect(filterTodos(todos, 'all')).not.toBe(todos);
  });

  it('works with empty array', () => {
    expect(filterTodos([], 'all')).toEqual([]);
    expect(filterTodos([], 'active')).toEqual([]);
    expect(filterTodos([], 'completed')).toEqual([]);
  });
});

describe('countActive', () => {
  it('returns correct count', () => {
    const todos = [
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
      makeTodo({ completed: false }),
    ];
    expect(countActive(todos)).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(countActive([])).toBe(0);
  });

  it('returns 0 when all completed', () => {
    expect(countActive([makeTodo({ completed: true })])).toBe(0);
  });
});

describe('countCompleted', () => {
  it('returns correct count', () => {
    const todos = [
      makeTodo({ completed: false }),
      makeTodo({ completed: true }),
      makeTodo({ completed: true }),
    ];
    expect(countCompleted(todos)).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(countCompleted([])).toBe(0);
  });

  it('returns 0 when none completed', () => {
    expect(countCompleted([makeTodo({ completed: false })])).toBe(0);
  });
});

describe('createTodo with dueDate', () => {
  it('creates todo with dueDate when provided', () => {
    const todo = createTodo('Test', { dueDate: '2026-04-15' });
    expect(todo.dueDate).toBe('2026-04-15');
  });

  it('creates todo with null dueDate by default', () => {
    const todo = createTodo('Test');
    expect(todo.dueDate).toBeNull();
  });
});

describe('createTodo with priority', () => {
  it('defaults to medium priority', () => {
    const todo = createTodo('Test');
    expect(todo.priority).toBe('medium');
  });

  it('sets priority from options', () => {
    const todo = createTodo('Test', { priority: 'high' });
    expect(todo.priority).toBe('high');
  });

  it('sets both dueDate and priority', () => {
    const todo = createTodo('Test', { dueDate: '2026-04-15', priority: 'low' });
    expect(todo.dueDate).toBe('2026-04-15');
    expect(todo.priority).toBe('low');
  });
});

describe('setPriority', () => {
  it('changes priority for matching ID', () => {
    const todos = [makeTodo({ priority: 'medium' })];
    const result = setPriority(todos, 'test-1', 'high');
    expect(result[0].priority).toBe('high');
  });

  it('does not mutate the original array', () => {
    const todos = Object.freeze([Object.freeze(makeTodo({ priority: 'medium' }))]);
    const result = setPriority(todos, 'test-1', 'low');
    expect(result).not.toBe(todos);
    expect(result[0].priority).toBe('low');
  });

  it('leaves other todos unchanged', () => {
    const todos = [makeTodo(), makeTodo({ id: 'test-2' })];
    const result = setPriority(todos, 'test-1', 'high');
    expect(result[1]).toBe(todos[1]);
  });
});

describe('sortByPriority', () => {
  it('sorts high first, then medium, then low', () => {
    const todos = [
      makeTodo({ id: '1', priority: 'low' }),
      makeTodo({ id: '2', priority: 'high' }),
      makeTodo({ id: '3', priority: 'medium' }),
    ];
    const result = sortByPriority(todos);
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('handles missing priority as medium', () => {
    const todos = [
      makeTodo({ id: '1', priority: 'low' }),
      makeTodo({ id: '2' }), // no priority field
    ];
    delete todos[1].priority;
    const result = sortByPriority(todos);
    expect(result.map(t => t.id)).toEqual(['2', '1']);
  });

  it('does not mutate input', () => {
    const todos = Object.freeze([
      makeTodo({ id: '1', priority: 'low' }),
      makeTodo({ id: '2', priority: 'high' }),
    ]);
    const result = sortByPriority(todos);
    expect(result).not.toBe(todos);
    expect(todos[0].id).toBe('1');
  });

  it('preserves order for same priority', () => {
    const todos = [
      makeTodo({ id: '1', priority: 'medium' }),
      makeTodo({ id: '2', priority: 'medium' }),
    ];
    const result = sortByPriority(todos);
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });
});

describe('isOverdue', () => {
  it('returns true for past date, incomplete todo', () => {
    expect(isOverdue(makeTodo({ dueDate: pastDateString() }))).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isOverdue(makeTodo({ dueDate: futureDateString() }))).toBe(false);
  });

  it('returns false for today', () => {
    expect(isOverdue(makeTodo({ dueDate: todayString() }))).toBe(false);
  });

  it('returns false for completed todo even with past date', () => {
    expect(isOverdue(makeTodo({ dueDate: pastDateString(), completed: true }))).toBe(false);
  });

  it('returns false when dueDate is null', () => {
    expect(isOverdue(makeTodo())).toBe(false);
  });
});

describe('isDueToday', () => {
  it('returns true when dueDate is today', () => {
    expect(isDueToday(makeTodo({ dueDate: todayString() }))).toBe(true);
  });

  it('returns false for past date', () => {
    expect(isDueToday(makeTodo({ dueDate: pastDateString() }))).toBe(false);
  });

  it('returns false for future date', () => {
    expect(isDueToday(makeTodo({ dueDate: futureDateString() }))).toBe(false);
  });

  it('returns false for completed todo due today', () => {
    expect(isDueToday(makeTodo({ dueDate: todayString(), completed: true }))).toBe(false);
  });

  it('returns false when dueDate is null', () => {
    expect(isDueToday(makeTodo())).toBe(false);
  });
});

describe('sortByDueDate', () => {
  it('sorts earliest due date first', () => {
    const todos = [
      makeTodo({ id: '1', dueDate: '2026-06-01' }),
      makeTodo({ id: '2', dueDate: '2026-01-01' }),
      makeTodo({ id: '3', dueDate: '2026-03-15' }),
    ];
    const result = sortByDueDate(todos);
    expect(result.map(t => t.id)).toEqual(['2', '3', '1']);
  });

  it('puts null-dueDate todos last', () => {
    const todos = [
      makeTodo({ id: '1', dueDate: null }),
      makeTodo({ id: '2', dueDate: '2026-01-01' }),
    ];
    const result = sortByDueDate(todos);
    expect(result.map(t => t.id)).toEqual(['2', '1']);
  });

  it('preserves order for same dates', () => {
    const todos = [
      makeTodo({ id: '1', dueDate: '2026-01-01' }),
      makeTodo({ id: '2', dueDate: '2026-01-01' }),
    ];
    const result = sortByDueDate(todos);
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });

  it('handles all-null dueDates', () => {
    const todos = [
      makeTodo({ id: '1' }),
      makeTodo({ id: '2' }),
    ];
    const result = sortByDueDate(todos);
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });

  it('does not mutate input', () => {
    const todos = Object.freeze([
      makeTodo({ id: '1', dueDate: '2026-06-01' }),
      makeTodo({ id: '2', dueDate: '2026-01-01' }),
    ]);
    const result = sortByDueDate(todos);
    expect(result).not.toBe(todos);
    expect(todos[0].id).toBe('1');
  });
});
