import { createTodo, toggleTodo, removeTodo, editTodo, reorderTodos, filterTodos, countActive, countCompleted } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

let todos = loadTodos();
let currentFilter = 'all';
let editingId = null;

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

  let draggedId = null;

  ul.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.todo-item');
    if (!target || !ul.contains(target)) return;
    ul.querySelectorAll('.todo-item').forEach(el => {
      el.classList.remove('drag-over-above', 'drag-over-below');
    });
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      target.classList.add('drag-over-above');
    } else {
      target.classList.add('drag-over-below');
    }
  });

  ul.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.todo-item');
    if (target) {
      target.classList.remove('drag-over-above', 'drag-over-below');
    }
  });

  ul.addEventListener('drop', (e) => {
    e.preventDefault();
    ul.querySelectorAll('.todo-item').forEach(el => {
      el.classList.remove('drag-over-above', 'drag-over-below');
    });
    const target = e.target.closest('.todo-item');
    if (!target || !draggedId) return;
    const targetId = target.getAttribute('data-id');
    if (draggedId === targetId) return;
    const fromIndex = todos.findIndex(t => t.id === draggedId);
    let toIndex = todos.findIndex(t => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY >= midY && toIndex < fromIndex) {
      toIndex++;
    } else if (e.clientY < midY && toIndex > fromIndex) {
      toIndex--;
    }
    todos = reorderTodos(todos, fromIndex, toIndex);
    saveTodos(todos);
    render();
  });

  const visibleTodos = filterTodos(todos, currentFilter);

  for (const todo of visibleTodos) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.setAttribute('data-testid', 'todo-item');
    li.setAttribute('data-id', todo.id);

    if (editingId === todo.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'todo-edit';
      editInput.value = todo.text;
      editInput.setAttribute('data-testid', 'todo-edit');

      let handled = false;

      const saveEdit = () => {
        if (handled) return;
        handled = true;
        const trimmed = editInput.value.trim();
        if (!trimmed) {
          todos = removeTodo(todos, todo.id);
        } else {
          try {
            todos = editTodo(todos, todo.id, editInput.value);
          } catch {
            // editTodo throws on empty — already handled above
          }
        }
        editingId = null;
        saveTodos(todos);
        render();
      };

      const cancelEdit = () => {
        if (handled) return;
        handled = true;
        editingId = null;
        render();
      };

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        }
      });

      editInput.addEventListener('blur', () => {
        saveEdit();
      });

      li.appendChild(editInput);

      requestAnimationFrame(() => {
        editInput.focus();
        editInput.select();
      });
    } else {
      li.draggable = true;

      li.addEventListener('dragstart', (e) => {
        draggedId = todo.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', todo.id);
        li.classList.add('dragging');
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        draggedId = null;
      });

      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.textContent = '\u2801\u2801\u2801';
      handle.setAttribute('data-testid', 'drag-handle');

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
      span.addEventListener('dblclick', () => {
        editingId = todo.id;
        render();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.setAttribute('data-testid', 'todo-delete');
      deleteBtn.addEventListener('click', () => {
        todos = removeTodo(todos, todo.id);
        saveTodos(todos);
        render();
      });

      li.appendChild(handle);
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
    }

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
