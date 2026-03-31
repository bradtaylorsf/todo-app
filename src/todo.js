export function createTodo(text) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    text: text.trim(),
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
  return todos.map((todo) =>
    todo.id === id ? { ...todo, text: newText } : todo
  );
}

export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((todo) => !todo.completed);
  if (filter === 'completed') return todos.filter((todo) => todo.completed);
  return todos;
}

export function countActive(todos) {
  return todos.filter((todo) => !todo.completed).length;
}

export function countCompleted(todos) {
  return todos.filter((todo) => todo.completed).length;
}
