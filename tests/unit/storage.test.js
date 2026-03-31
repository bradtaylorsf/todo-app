import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTodos, loadTodos, clearTodos } from '../../src/storage.js';

function makeTodo(overrides = {}) {
  return {
    id: 'test-1',
    text: 'Test todo',
    completed: false,
    createdAt: 1000,
    ...overrides,
  };
}

function createMockStorage() {
  const store = {};
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMockStorage());
});

describe('saveTodos', () => {
  it('saves serialized todos to localStorage', () => {
    const todos = [makeTodo()];
    saveTodos(todos);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'todo-app-todos',
      JSON.stringify(todos)
    );
  });

  it('overwrites previously saved data', () => {
    saveTodos([makeTodo({ text: 'First' })]);
    saveTodos([makeTodo({ text: 'Second' })]);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'todo-app-todos',
      JSON.stringify([makeTodo({ text: 'Second' })])
    );
  });
});

describe('loadTodos', () => {
  it('loads and deserializes saved todos', () => {
    const todos = [makeTodo(), makeTodo({ id: 'test-2', text: 'Another' })];
    saveTodos(todos);
    expect(loadTodos()).toEqual(todos);
  });

  it('returns [] when nothing saved (null)', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('returns [] for invalid JSON', () => {
    localStorage.getItem = vi.fn(() => 'not json');
    expect(loadTodos()).toEqual([]);
  });

  it('returns [] for non-array JSON (number)', () => {
    localStorage.getItem = vi.fn(() => '42');
    expect(loadTodos()).toEqual([]);
  });

  it('returns [] for non-array JSON (object)', () => {
    localStorage.getItem = vi.fn(() => '{"key": "value"}');
    expect(loadTodos()).toEqual([]);
  });
});

describe('clearTodos', () => {
  it('removes the key from localStorage', () => {
    saveTodos([makeTodo()]);
    clearTodos();
    expect(localStorage.removeItem).toHaveBeenCalledWith('todo-app-todos');
  });
});

describe('round-trip', () => {
  it('save then load returns equivalent data', () => {
    const todos = [
      makeTodo(),
      makeTodo({ id: 'test-2', text: 'Second', completed: true }),
    ];
    saveTodos(todos);
    expect(loadTodos()).toEqual(todos);
  });
});

describe('error handling', () => {
  it('loadTodos returns [] if localStorage.getItem throws', () => {
    localStorage.getItem = vi.fn(() => {
      throw new Error('Access denied');
    });
    expect(loadTodos()).toEqual([]);
  });

  it('saveTodos does not throw if localStorage.setItem throws', () => {
    localStorage.setItem = vi.fn(() => {
      throw new Error('Quota exceeded');
    });
    expect(() => saveTodos([makeTodo()])).not.toThrow();
  });
});
