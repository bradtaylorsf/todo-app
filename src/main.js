import { createTodo, toggleTodo, removeTodo, countActive } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

let todos = loadTodos();

const app = document.getElementById('app');

function render() {
  app.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  const h1 = document.createElement('h1');
  h1.textContent = 'Todo App';
  container.appendChild(h1);

  const form = document.createElement('form');
  form.className = 'todo-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'What needs to be done?';
  input.setAttribute('data-testid', 'todo-input');

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Add';
  addBtn.setAttribute('data-testid', 'add-button');

  form.appendChild(input);
  form.appendChild(addBtn);
  container.appendChild(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const todo = createTodo(input.value);
      todos = [...todos, todo];
      saveTodos(todos);
      render();
    } catch {
      // Empty input — ignore
    }
  });

  const ul = document.createElement('ul');
  ul.setAttribute('data-testid', 'todo-list');

  for (const todo of todos) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.setAttribute('data-testid', 'todo-item');
    li.setAttribute('data-id', todo.id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('data-testid', 'todo-checkbox');
    checkbox.addEventListener('change', () => {
      todos = toggleTodo(todos, todo.id);
      saveTodos(todos);
      render();
    });

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;
    span.setAttribute('data-testid', 'todo-text');

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.setAttribute('data-testid', 'todo-delete');
    deleteBtn.addEventListener('click', () => {
      todos = removeTodo(todos, todo.id);
      saveTodos(todos);
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  }

  container.appendChild(ul);

  const count = document.createElement('p');
  count.setAttribute('data-testid', 'todo-count');
  count.textContent = `${countActive(todos)} items left`;
  container.appendChild(count);

  app.appendChild(container);
}

render();
