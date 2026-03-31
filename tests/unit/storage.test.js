import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveTodos, loadTodos, clearTodos } from '../../src/storage.js';

function createMockLocalStorage() {
  const store = {};
  return {
    getItem(key) { return key in store ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    _store: store,
  };
}

describe('storage', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    globalThis.localStorage = mockStorage;
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it('saves and loads todos (round-trip)', () => {
    const todos = [
      { id: '1', text: 'Buy milk', completed: false, createdAt: 1000 },
      { id: '2', text: 'Walk dog', completed: true, createdAt: 2000 },
    ];
    saveTodos(todos);
    expect(loadTodos()).toEqual(todos);
  });

  it('returns empty array when no data saved', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('returns empty array for corrupt JSON', () => {
    mockStorage.setItem('todo-app-todos', 'not valid json{{{');
    expect(loadTodos()).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    mockStorage.setItem('todo-app-todos', '');
    expect(loadTodos()).toEqual([]);
  });

  it('returns empty array when stored value is valid JSON but not an array', () => {
    mockStorage.setItem('todo-app-todos', '42');
    expect(loadTodos()).toEqual([]);
  });

  it('writes under the correct key', () => {
    saveTodos([{ id: '1', text: 'Test', completed: false, createdAt: 1000 }]);
    expect(mockStorage._store['todo-app-todos']).toBeDefined();
    expect(JSON.parse(mockStorage._store['todo-app-todos'])).toHaveLength(1);
  });

  it('clearTodos removes data so loadTodos returns empty array', () => {
    saveTodos([{ id: '1', text: 'Test', completed: false, createdAt: 1000 }]);
    clearTodos();
    expect(loadTodos()).toEqual([]);
  });
});
