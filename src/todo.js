export function createTodo(text, options = {}) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Todo text cannot be empty');
  }
  const { dueDate = null, priority = 'medium' } = options;
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
    dueDate: dueDate || null,
    priority,
  };
}

export function setPriority(todos, id, priority) {
  return todos.map(todo =>
    todo.id === id ? { ...todo, priority } : todo
  );
}

export function sortByPriority(todos) {
  const weight = { high: 0, medium: 1, low: 2 };
  return [...todos].sort((a, b) =>
    (weight[a.priority] ?? 1) - (weight[b.priority] ?? 1)
  );
}

export function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(todo.dueDate + 'T00:00:00');
  return due < today;
}

export function isDueToday(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return todo.dueDate === `${yyyy}-${mm}-${dd}`;
}

export function sortByDueDate(todos) {
  return [...todos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function toggleTodo(todos, id) {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function editTodo(todos, id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    throw new Error('Todo text cannot be empty');
  }
  return todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
}

export function reorderTodos(todos, fromIndex, toIndex) {
  const result = [...todos];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((t) => !t.completed);
  if (filter === 'completed') return todos.filter((t) => t.completed);
  return [...todos];
}

export function countActive(todos) {
  return todos.filter((t) => !t.completed).length;
}

export function countCompleted(todos) {
  return todos.filter((t) => t.completed).length;
}
