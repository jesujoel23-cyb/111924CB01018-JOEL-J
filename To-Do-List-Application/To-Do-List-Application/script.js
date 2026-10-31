const STORAGE_KEY = 'todo-list-application-v1';
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter');

let tasks = loadTasks();
let activeFilter = 'all';

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved.filter(task => task && typeof task.text === 'string' && typeof task.completed === 'boolean');
  } catch (error) {
    console.warn('Could not load saved tasks:', error);
  }
  return [
    { id: 1, text: 'Complete assignment', completed: false },
    { id: 2, text: 'Read a book', completed: true },
    { id: 3, text: 'Attend class', completed: false },
    { id: 4, text: 'Workout', completed: true },
    { id: 5, text: 'Prepare for exam', completed: false }
  ];
}

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  catch (error) { console.warn('Could not save tasks:', error); }
}

function addTask(text) {
  const cleanText = text.trim();
  if (!cleanText) {
    taskInput.focus();
    taskInput.setCustomValidity('Please enter a task.');
    taskInput.reportValidity();
    taskInput.setCustomValidity('');
    return;
  }
  tasks.unshift({ id: Date.now() + Math.random(), text: cleanText, completed: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function createIconButton(className, label, svg, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `icon-btn ${className}`;
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = svg;
  button.addEventListener('click', onClick);
  return button;
}

function renderTasks() {
  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;
  document.getElementById('allCount').textContent = tasks.length;
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('pendingSummary').textContent = `${pending} pending`;
  document.getElementById('completedSummary').textContent = `${completed} completed`;

  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => activeFilter === 'all' || (activeFilter === 'pending' ? !task.completed : task.completed));
  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.text} as ${task.completed ? 'pending' : 'completed'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const checkSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="m8 12 2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const trashSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    actions.append(createIconButton('complete-btn', task.completed ? 'Mark as pending' : 'Mark as completed', checkSvg, () => toggleTask(task.id)));
    actions.append(createIconButton('delete-btn', 'Delete task', trashSvg, () => deleteTask(task.id)));

    item.append(checkbox, text, actions);
    taskList.append(item);
  });

  emptyState.classList.toggle('visible', visibleTasks.length === 0);
  emptyState.textContent = tasks.length === 0 ? 'Your list is empty. Add a task to get started!' : `No ${activeFilter} tasks right now.`;
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  addTask(taskInput.value);
});

filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  renderTasks();
}));

renderTasks();
