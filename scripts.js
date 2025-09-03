const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const taskList = document.getElementById("task-list");
const categorySelect = document.getElementById("category-select");
const filterSelect = document.getElementById("filter-select");
let currentFilter = "all"; // default
const searchInput = document.getElementById("search-input");
let searchQuery = "";
const dueDateInput = document.getElementById("due-date-input");
const languageSelect = document.getElementById("language-select");
let currentLanguage = localStorage.getItem("language") || "en";
const toggle = document.getElementById('theme-toggle');
const root = document.documentElement;


let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
// toggle button code //
// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);
}

toggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const nextTheme = current === 'dark' ? 'light' : 'dark';

  root.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
  updateToggleIcon(nextTheme);
});

function updateToggleIcon(theme) {
  toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}
//add language //
const translations = {
  en: {
    addTaskPlaceholder: "Enter your task...",
    addButton: "Add",
    filterLabel: "Filter by Category:",
    searchLabel: "Search Tasks:",
    languageLabel: "Language:",
    reminder: "Reminder:",
  },
  es: {
    addTaskPlaceholder: "Escribe tu tarea...",
    addButton: "Agregar",
    filterLabel: "Filtrar por categoría:",
    searchLabel: "Buscar tareas:",
    languageLabel: "Idioma:",
    reminder: "Recordatorio:",
  },
  fr: {
    addTaskPlaceholder: "Entrez votre tâche...",
    addButton: "Ajouter",
    filterLabel: "Filtrer par catégorie:",
    searchLabel: "Rechercher des tâches:",
    languageLabel: "Langue:",
    reminder: "Rappel:",
  },
};

const suggestionMap = {
  work: ["Check emails", "Plan tomorrow's schedule", "Stand-up meeting"],
  personal: ["Call family", "Clean your room", "Exercise for 30 mins"],
  shopping: ["Buy groceries", "Order household items", "Check online deals"],
  study: ["Review notes", "Finish assignments", "Read a chapter"],
  general: ["Journal for 5 minutes", "Plan your week", "Reflect on goals"],
};


function applyLanguage(lang) {
  const t = translations[lang] || translations.en;

  // Update placeholders and labels
  document.getElementById("task-input").placeholder = t.addTaskPlaceholder;
  document.querySelector("#task-form button").textContent = t.addButton;
  document.querySelector("#filter-container label").textContent = t.filterLabel;
  document.querySelector("#search-container label").textContent = t.searchLabel;
  document.querySelector("#language-container label").textContent = t.languageLabel;

  // Update selected value
  languageSelect.value = lang;

  // Save to localStorage or cookies
  localStorage.setItem("language", lang);
}
//adding suggestions to task //
function showSuggestions(category) {
  const suggestionsList = document.getElementById("suggestions-list");
  suggestionsList.innerHTML = ""; // Clear previous

  const suggestions = suggestionMap[category] || suggestionMap["general"];
  suggestions.forEach((taskText) => {
    const li = document.createElement("li");
    li.textContent = taskText;
    li.addEventListener("click", () => {
      // When clicked, auto-fill the task input
      document.getElementById("task-input").value = taskText;
    });
    suggestionsList.appendChild(li);
  });
}

//added cookies //
function setCookie(name, value, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

//check due date //
function checkDueReminders() {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const reminders = tasks.filter(task => {
    return (
      task.dueDate &&
      !task.completed &&
      task.dueDate <= today // Show if due today or overdue
    );
  });

  if (reminders.length > 0) {
    let message = "⏰ Reminder:\n";
    reminders.forEach(task => {
      message += `• ${task.text} (Due: ${task.dueDate})\n`;
    });

    alert(message);
  }
}

function renderTasks() {
  taskList.innerHTML = "";
    // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    const matchesCategory =
      currentFilter === "all" || (task.category || "general") === currentFilter;

    const matchesSearch =
      task.text.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });
  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    const taskPriority = task.priority || "medium";
    const taskCategory = task.category || "general";
    const dueDate = task.dueDate || "";
    const dueDateLabel = dueDate
    ? `<span class="due-date">📅 ${dueDate}</span>`
    : "";
    const priorityClass = `priority ${task.priority}`;
    const priorityLabel = `<span class="${priorityClass}">${taskPriority.toUpperCase()}</span>`;
    const categoryClass = `category ${taskCategory}`;
    const categoryLabel = `<span class="${categoryClass}">${taskCategory}</span>`;
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}" class="toggle-task">
        <span>${task.text}</span>${priorityLabel} ${categoryLabel}${dueDateLabel}
      </label>
      <div class="task-actions">
        <button class="edit-task" data-index="${index}">✏️</button>
        <button class="delete-task" data-index="${index}">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function addTask(text, priority, category, dueDate) {
  tasks.push({ text, completed: false, priority, category, dueDate});
  saveTasks();
  renderTasks();
  checkDueReminders(); 
}

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text === "") {
    alert("Task cannot be empty.");
    return;
  }
  const priority = prioritySelect.value;
  const category = categorySelect.value;
  const dueDate = dueDateInput.value;
  addTask(text, priority, category, dueDate);
  prioritySelect.value = "medium"; // reset after adding
  categorySelect.value = "general";
  dueDateInput.value = ""; // clear date
  taskInput.value = "";
});
//add category event //
categorySelect.addEventListener("change", () => {
  showSuggestions(categorySelect.value);
});
// filter tasks list //
filterSelect.addEventListener("change", () => {
  currentFilter = filterSelect.value;
  setCookie("todo_filter", currentFilter);
  renderTasks();
});
//search event listner //
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  setCookie("todo_search", searchQuery);
  renderTasks();
});

// Delegated event listeners
taskList.addEventListener("click", function (e) {
  const index = e.target.dataset.index;
  if (e.target.classList.contains("delete-task")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  } else if (e.target.classList.contains("edit-task")) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText && newText.trim()) {
    const newPriority = prompt("Edit priority (low, medium, high):", tasks[index].priority || "medium");
    const newCategory = prompt("Edit category (general, work, personal, shopping, study):", tasks[index].category || "general");
    const newDueDate = prompt("Edit due date (YYYY-MM-DD):", tasks[index].dueDate || "");

    const validPriorities = ["low", "medium", "high"];
    const validCategories = ["general", "work", "personal", "shopping", "study"];

    if (validPriorities.includes(newPriority.toLowerCase()) && validCategories.includes(newCategory.toLowerCase())) {
      tasks[index].text = newText.trim();
      tasks[index].priority = newPriority.toLowerCase();
      tasks[index].category = newCategory.toLowerCase();
      tasks[index].dueDate = newDueDate;
      saveTasks();
      renderTasks();
      checkDueReminders(); 
    } else {
      alert("Invalid priority or category.");
    }
  }
}
});
taskList.addEventListener("change", function (e) {
  if (e.target.classList.contains("toggle-task")) {
    const index = e.target.dataset.index;
    tasks[index].completed = e.target.checked;
    saveTasks();
    renderTasks();
  }
});
languageSelect.addEventListener("change", () => {
  const selectedLang = languageSelect.value;
  currentLanguage = selectedLang;
  applyLanguage(currentLanguage);
});
window.addEventListener("load", () => {
  loadTasks();         // Load from localStorage
  applyLanguage(currentLanguage);
  showSuggestions(categorySelect.value);
   // Restore filter and search from cookies
  const savedFilter = getCookie("todo_filter");
  const savedSearch = getCookie("todo_search");
  if (savedFilter) {
    currentFilter = savedFilter;
    filterSelect.value = savedFilter;
  }

  if (savedSearch) {
    searchQuery = savedSearch;
    searchInput.value = savedSearch;
  }
  renderTasks();       // Render to the page
  checkDueReminders(); // ✅ Check and show any reminders
  restorePreviousFilters();
});

renderTasks();
