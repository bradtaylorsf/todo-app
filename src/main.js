import { createTodo, toggleTodo, removeTodo, filterTodos, countActive, countCompleted } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

let todos = loadTodos();
let currentFilter = 'all';

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

  const visibleTodos = filterTodos(todos, currentFilter);

  for (const todo of visibleTodos) {
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

  const footer = document.createElement('div');
  footer.className = 'todo-footer';

  const count = document.createElement('span');
  count.setAttribute('data-testid', 'todo-count');
  const activeCount = countActive(todos);
  count.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
  footer.appendChild(count);

  const filterGroup = document.createElement('div');
  filterGroup.className = 'filter-buttons';

  for (const filter of ['all', 'active', 'completed']) {
    const btn = document.createElement('button');
    btn.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
    btn.setAttribute('data-testid', `filter-${filter}`);
    if (filter === currentFilter) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentFilter = filter;
      render();
    });
    filterGroup.appendChild(btn);
  }

  footer.appendChild(filterGroup);

  if (countCompleted(todos) > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear completed';
    clearBtn.setAttribute('data-testid', 'clear-completed');
    clearBtn.className = 'clear-completed';
    clearBtn.addEventListener('click', () => {
      todos = todos.filter(t => !t.completed);
      saveTodos(todos);
      render();
    });
    footer.appendChild(clearBtn);
  }

  container.appendChild(footer);

  app.appendChild(container);
}

render();
