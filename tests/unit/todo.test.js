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

describe('createTodo', () => {
  it('creates todo with correct shape', () => {
    const todo = createTodo('Buy milk');
    expect(todo).toEqual({
      id: expect.any(String),
      text: 'Buy milk',
      completed: false,
      createdAt: expect.any(Number),
    });
  });

  it('sets completed to false', () => {
    expect(createTodo('Test').completed).toBe(false);
  });

  it('generates unique IDs across calls', () => {
    const a = createTodo('A');
    const b = createTodo('B');
    expect(a.id).not.toBe(b.id);
  });

  it('trims whitespace from text', () => {
    expect(createTodo('  hello  ').text).toBe('hello');
  });
});

describe('toggleTodo', () => {
  it('toggles completed from false to true', () => {
    const todos = [createTodo('A')];
    const result = toggleTodo(todos, todos[0].id);
    expect(result[0].completed).toBe(true);
  });

  it('toggles completed from true to false', () => {
    const todos = [{ ...createTodo('A'), completed: true }];
    const result = toggleTodo(todos, todos[0].id);
    expect(result[0].completed).toBe(false);
  });

  it('does not mutate original array', () => {
    const todos = [createTodo('A')];
    const original = [...todos];
    toggleTodo(todos, todos[0].id);
    expect(todos).toEqual(original);
    expect(todos[0].completed).toBe(false);
  });

  it('returns unchanged array for non-existent ID', () => {
    const todos = [createTodo('A')];
    const result = toggleTodo(todos, 'nonexistent');
    expect(result).toEqual(todos);
  });
});

describe('removeTodo', () => {
  it('removes todo by ID', () => {
    const todos = [createTodo('A'), createTodo('B')];
    const result = removeTodo(todos, todos[0].id);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('B');
  });

  it('does not mutate original array', () => {
    const todos = [createTodo('A')];
    removeTodo(todos, todos[0].id);
    expect(todos).toHaveLength(1);
  });

  it('returns unchanged array for non-existent ID', () => {
    const todos = [createTodo('A')];
    const result = removeTodo(todos, 'nonexistent');
    expect(result).toEqual(todos);
  });
});

describe('editTodo', () => {
  it('updates text for matching ID', () => {
    const todos = [createTodo('Old')];
    const result = editTodo(todos, todos[0].id, 'New');
    expect(result[0].text).toBe('New');
  });

  it('does not mutate original array', () => {
    const todos = [createTodo('Old')];
    editTodo(todos, todos[0].id, 'New');
    expect(todos[0].text).toBe('Old');
  });

  it('returns unchanged array for non-existent ID', () => {
    const todos = [createTodo('A')];
    const result = editTodo(todos, 'nonexistent', 'New');
    expect(result).toEqual(todos);
  });
});

describe('filterTodos', () => {
  const todos = [
    { id: '1', text: 'A', completed: false, createdAt: 1 },
    { id: '2', text: 'B', completed: true, createdAt: 2 },
    { id: '3', text: 'C', completed: false, createdAt: 3 },
  ];

  it("returns all todos for 'all'", () => {
    expect(filterTodos(todos, 'all')).toEqual(todos);
  });

  it("returns only active todos for 'active'", () => {
    const result = filterTodos(todos, 'active');
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it("returns only completed todos for 'completed'", () => {
    const result = filterTodos(todos, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns all todos for unknown filter value', () => {
    expect(filterTodos(todos, 'invalid')).toEqual(todos);
  });
});

describe('countActive', () => {
  it('returns count of incomplete todos', () => {
    const todos = [
      { id: '1', text: 'A', completed: false, createdAt: 1 },
      { id: '2', text: 'B', completed: true, createdAt: 2 },
      { id: '3', text: 'C', completed: false, createdAt: 3 },
    ];
    expect(countActive(todos)).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(countActive([])).toBe(0);
  });
});

describe('countCompleted', () => {
  it('returns count of completed todos', () => {
    const todos = [
      { id: '1', text: 'A', completed: false, createdAt: 1 },
      { id: '2', text: 'B', completed: true, createdAt: 2 },
    ];
    expect(countCompleted(todos)).toBe(1);
  });

  it('returns 0 for empty array', () => {
    expect(countCompleted([])).toBe(0);
  });
});
