import { createTodo, toggleTodo, removeTodo, countActive } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

let todos = loadTodos();

function render() {
  const app = document.getElementById('app');
  const activeCount = countActive(todos);

  app.innerHTML = `
    <h1>Todo App</h1>
    <form class="todo-form">
      <input
        type="text"
        data-testid="todo-input"
        placeholder="What needs to be done?"
        autofocus
      >
      <button type="submit" data-testid="add-button">Add</button>
    </form>
    <ul class="todo-list" data-testid="todo-list">
      ${todos.map(todo => `
        <li class="todo-item${todo.completed ? ' completed' : ''}" data-testid="todo-item" data-id="${todo.id}">
          <input
            type="checkbox"
            class="todo-checkbox"
            data-testid="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
          >
          <span class="todo-text" data-testid="todo-text">${escapeHtml(todo.text)}</span>
          <button class="todo-delete" data-testid="todo-delete" aria-label="Delete">&times;</button>
        </li>
      `).join('')}
    </ul>
    <p class="todo-count" data-testid="todo-count">${activeCount} ${activeCount === 1 ? 'item' : 'items'} left</p>
  `;

  app.querySelector('.todo-form').addEventListener('submit', handleAdd);
  app.querySelector('.todo-list').addEventListener('click', handleListClick);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function handleAdd(e) {
  e.preventDefault();
  const input = document.querySelector('[data-testid="todo-input"]');
  const text = input.value.trim();
  if (!text) return;

  todos = [...todos, createTodo(text)];
  saveTodos(todos);
  render();
}

function handleListClick(e) {
  const li = e.target.closest('[data-testid="todo-item"]');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.closest('[data-testid="todo-checkbox"]')) {
    todos = toggleTodo(todos, id);
    saveTodos(todos);
    render();
  } else if (e.target.closest('[data-testid="todo-delete"]')) {
    todos = removeTodo(todos, id);
    saveTodos(todos);
    render();
  }
}

render();
