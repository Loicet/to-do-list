// Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const priorityInput = document.getElementById('priorityInput');
const tasksList = document.getElementById('tasksList');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompleted');
const themeToggle = document.getElementById('themeToggle');

let tasks = []; // {id, text, completed, category, priority}
const STORAGE_KEY = 'todo_tasks_v1';

/* ---------- LocalStorage ---------- */
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- CRUD ---------- */
function addTask(text, category, priority) {
  tasks.unshift({ id: Date.now().toString(), text, completed: false, category, priority });
  saveTasks(); renderTasks();
}
function toggleComplete(id) {
  const t = tasks.find(x => x.id === id);
  if (t) t.completed = !t.completed;
  saveTasks(); renderTasks();
}
function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveTasks(); renderTasks();
}
function updateTaskText(id, text) {
  const t = tasks.find(x => x.id === id);
  if (t) t.text = text;
  saveTasks(); renderTasks();
}

/* ---------- Filters ---------- */
function getVisibleTasks() {
  const status = filterStatus.value;
  const category = filterCategory.value;
  const q = searchInput.value.trim().toLowerCase();

  return tasks.filter(t => {
    if (status === 'active' && t.completed) return false;
    if (status === 'completed' && !t.completed) return false;
    if (category !== 'All' && t.category !== category) return false;
    if (q && !t.text.toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ---------- Render ---------- */
function renderTasks() {
  tasksList.innerHTML = '';
  const visible = getVisibleTasks();

  if (visible.length === 0) {
    tasksList.innerHTML = `<li class="p-4 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg">No tasks</li>`;
    return;
  }

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = "flex items-start gap-3 p-3 rounded-lg shadow-sm bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700";

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = task.completed;
    cb.addEventListener('change', () => toggleComplete(task.id));
    li.appendChild(cb);

    const text = document.createElement('div');
    text.className = "flex-1";
    text.textContent = task.text;
    if (task.completed) text.classList.add("line-through", "opacity-60");
    // inline edit
    text.addEventListener('dblclick', () => startEdit(task.id, text));
    li.appendChild(text);

    const meta = document.createElement('span');
    meta.className = "text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700";
    meta.textContent = `${task.category} • ${task.priority}`;
    li.appendChild(meta);

    const del = document.createElement('button');
    del.textContent = "Delete";
    del.className = "ml-auto px-2 py-1 text-sm text-red-600 ring-1 ring-red-200 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30";
    del.onclick = () => deleteTask(task.id);
    li.appendChild(del);

    tasksList.appendChild(li);
  });
}

/* ---------- Inline edit ---------- */
function startEdit(id, el) {
  const input = document.createElement('input');
  input.type = "text"; input.value = el.textContent;
  input.className = "w-full p-2 rounded-md ring-1 ring-gray-200 dark:ring-gray-700";
  el.replaceWith(input); input.focus();

  input.addEventListener('blur', () => {
    if (input.value.trim()) updateTaskText(id, input.value.trim());
    else renderTasks();
  });
  input.addEventListener('keydown', e => {
    if (e.key === "Enter") updateTaskText(id, input.value.trim());
    if (e.key === "Escape") renderTasks();
  });
}

/* ---------- Theme toggle ---------- */
function setDarkMode(on) {
  document.documentElement.classList.toggle('dark', on);
  localStorage.setItem('theme', on ? 'dark' : 'light');
  document.getElementById('iconSun').classList.toggle('hidden', on);
  document.getElementById('iconMoon').classList.toggle('hidden', !on);
}
themeToggle.addEventListener('click', () => {
  setDarkMode(!document.documentElement.classList.contains('dark'));
});

/* ---------- Init ---------- */
function init() {
  loadTasks();
  setDarkMode(localStorage.getItem('theme') === 'dark');
  renderTasks();
}
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (taskInput.value.trim()) {
    addTask(taskInput.value.trim(), categoryInput.value, priorityInput.value);
    taskInput.value = '';
  }
});
filterStatus.onchange = renderTasks;
filterCategory.onchange = renderTasks;
searchInput.oninput = renderTasks;
clearCompletedBtn.onclick = () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks(); renderTasks();
};
init();
