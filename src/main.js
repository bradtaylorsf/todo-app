import { createTodo, toggleTodo, removeTodo, editTodo, reorderTodos, filterTodos, countActive, countCompleted, isOverdue, isDueToday, sortByPriority, toggleAllTodos } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

let todos = loadTodos();
let currentFilter = 'all';
let editingId = null;

const app = document.getElementById('app');

// Live region for screen reader announcements
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('id', 'live-region');
liveRegion.className = 'sr-only';
document.body.appendChild(liveRegion);

function announce(message) {
  liveRegion.textContent = message;
}

// Shortcuts help overlay
const shortcutsOverlay = document.createElement('div');
shortcutsOverlay.className = 'shortcuts-overlay hidden';
shortcutsOverlay.setAttribute('data-testid', 'shortcuts-help');
shortcutsOverlay.innerHTML = `
  <div class="shortcuts-content">
    <h2>Keyboard Shortcuts</h2>
    <dl class="shortcuts-list">
      <div><dt>/</dt><dd>Focus input</dd></div>
      <div><dt>1</dt><dd>Show All</dd></div>
      <div><dt>2</dt><dd>Show Active</dd></div>
      <div><dt>3</dt><dd>Show Completed</dd></div>
      <div><dt>Ctrl/⌘+A</dt><dd>Toggle all todos</dd></div>
      <div><dt>?</dt><dd>Toggle this help</dd></div>
    </dl>
    <p class="shortcuts-dismiss">Press <kbd>Esc</kbd> or <kbd>?</kbd> to close</p>
  </div>
`;
document.body.appendChild(shortcutsOverlay);

shortcutsOverlay.addEventListener('click', (e) => {
  if (e.target === shortcutsOverlay) {
    shortcutsOverlay.classList.add('hidden');
  }
});

// Shortcuts trigger button
const shortcutsTrigger = document.createElement('button');
shortcutsTrigger.className = 'shortcuts-trigger';
shortcutsTrigger.setAttribute('data-testid', 'shortcuts-trigger');
shortcutsTrigger.setAttribute('aria-label', 'Show keyboard shortcuts');
shortcutsTrigger.textContent = '?';
shortcutsTrigger.addEventListener('click', () => {
  shortcutsOverlay.classList.toggle('hidden');
});
document.body.appendChild(shortcutsTrigger);

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  const inputFocused = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  const overlayVisible = !shortcutsOverlay.classList.contains('hidden');

  if (e.key === 'Escape' && overlayVisible) {
    shortcutsOverlay.classList.add('hidden');
    return;
  }

  if (e.key === '?' && !inputFocused) {
    shortcutsOverlay.classList.toggle('hidden');
    return;
  }

  // Disable other shortcuts while overlay is visible
  if (overlayVisible) return;

  if (e.key === '/') {
    e.preventDefault();
    const todoInput = document.querySelector('[data-testid="todo-input"]');
    if (todoInput) todoInput.focus();
    return;
  }

  if (!inputFocused) {
    if (e.key === '1') {
      currentFilter = 'all';
      render();
      return;
    }
    if (e.key === '2') {
      currentFilter = 'active';
      render();
      return;
    }
    if (e.key === '3') {
      currentFilter = 'completed';
      render();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      todos = toggleAllTodos(todos);
      saveTodos(todos);
      render();
      const allCompleted = todos.every(t => t.completed);
      announce(allCompleted ? 'All todos completed' : 'All todos marked active');
      return;
    }
  }
});

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

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.setAttribute('data-testid', 'due-date-input');

  const prioritySelect = document.createElement('select');
  prioritySelect.setAttribute('data-testid', 'priority-select');
  for (const p of ['low', 'medium', 'high']) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    if (p === 'medium') opt.selected = true;
    prioritySelect.appendChild(opt);
  }

  form.appendChild(input);
  form.appendChild(dateInput);
  form.appendChild(prioritySelect);
  form.appendChild(addBtn);
  container.appendChild(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const todo = createTodo(input.value, { dueDate: dateInput.value || null, priority: prioritySelect.value });
      todos = [...todos, todo];
      saveTodos(todos);
      render();
      announce('Todo added');
    } catch {
      // Empty input — ignore
    }
  });

  const ul = document.createElement('ul');
  ul.setAttribute('data-testid', 'todo-list');
  ul.setAttribute('role', 'list');

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
    let className = 'todo-item';
    if (todo.completed) className += ' completed';
    if (isOverdue(todo)) className += ' overdue';
    if (isDueToday(todo)) className += ' due-today';
    li.className = className;
    li.setAttribute('data-testid', 'todo-item');
    li.setAttribute('data-id', todo.id);
    li.setAttribute('role', 'listitem');
    if (isOverdue(todo)) li.setAttribute('data-overdue', '');

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
      checkbox.setAttribute('aria-label', `Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => {
        todos = toggleTodo(todos, todo.id);
        saveTodos(todos);
        render();
        const toggled = todos.find(t => t.id === todo.id);
        announce(toggled?.completed ? 'Todo completed' : 'Todo marked active');
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
      deleteBtn.setAttribute('aria-label', `Delete ${todo.text}`);
      deleteBtn.addEventListener('click', () => {
        todos = removeTodo(todos, todo.id);
        saveTodos(todos);
        render();
        announce('Todo deleted');
      });

      const priorityDot = document.createElement('span');
      const todoPriority = todo.priority || 'medium';
      priorityDot.className = `priority-indicator priority-${todoPriority}`;
      priorityDot.setAttribute('data-testid', 'priority-indicator');

      li.appendChild(priorityDot);
      li.appendChild(handle);
      li.appendChild(checkbox);
      li.appendChild(span);

      if (todo.dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'todo-due-date';
        dueDateSpan.setAttribute('data-testid', 'todo-due-date');
        if (isDueToday(todo)) {
          dueDateSpan.textContent = 'Today';
        } else {
          const date = new Date(todo.dueDate + 'T00:00:00');
          dueDateSpan.textContent = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        }
        li.appendChild(dueDateSpan);
      }

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
    btn.setAttribute('aria-pressed', String(filter === currentFilter));
    if (filter === currentFilter) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentFilter = filter;
      render();
    });
    filterGroup.appendChild(btn);
  }

  footer.appendChild(filterGroup);

  const sortPriorityBtn = document.createElement('button');
  sortPriorityBtn.textContent = 'Sort by priority';
  sortPriorityBtn.setAttribute('data-testid', 'sort-priority');
  sortPriorityBtn.className = 'sort-priority';
  sortPriorityBtn.addEventListener('click', () => {
    todos = sortByPriority(todos);
    saveTodos(todos);
    render();
  });
  footer.appendChild(sortPriorityBtn);

  if (countCompleted(todos) > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear completed';
    clearBtn.setAttribute('data-testid', 'clear-completed');
    clearBtn.className = 'clear-completed';
    clearBtn.addEventListener('click', () => {
      todos = todos.filter(t => !t.completed);
      saveTodos(todos);
      render();
      announce('Completed todos cleared');
    });
    footer.appendChild(clearBtn);
  }

  container.appendChild(footer);

  app.appendChild(container);
}

render();
