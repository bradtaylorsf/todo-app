const STORAGE_KEY = 'todo-app-todos';

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearTodos() {
  localStorage.removeItem(STORAGE_KEY);
}
