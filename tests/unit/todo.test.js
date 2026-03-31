import { describe, it, expect } from 'vitest';
import {
  createTodo,
  toggleTodo,
  removeTodo,
  editTodo,
  filterTodos,
  countActive,
  countCompleted,
} from '../../src/todo.js';

function makeTodo(overrides = {}) {
  return {
    id: 'test-1',
    text: 'Test todo',
    completed: false,
    createdAt: 1000,
    ...overrides,
  };
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
