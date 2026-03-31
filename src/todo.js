export function createTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Todo text cannot be empty');
  }
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  };
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
