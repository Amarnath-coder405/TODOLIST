document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const prioritySelect = document.getElementById("priority-select");
  const categorySelect = document.getElementById("category-select");
  const dueDateInput = document.getElementById("due-date");
  const taskList = document.getElementById("task-list");
  const themeToggle = document.getElementById("theme-toggle");
  const emptyMessage = document.getElementById("empty-message");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("search-input");

  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-form");
  const editText = document.getElementById("edit-text");
  const editPriority = document.getElementById("edit-priority");
  const editCategory = document.getElementById("edit-category");
  const editDate = document.getElementById("edit-date");
  const cancelEdit = document.getElementById("cancel-edit");

  let editIndex = null;
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let theme = localStorage.getItem("theme") || "light";

  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";

  const saveTasks = () => localStorage.setItem("tasks", JSON.stringify(tasks));

  const filterTasks = () => {
    const query = searchInput.value.toLowerCase().trim();
    return tasks.filter(t => t.text.toLowerCase().includes(query));
  };

  const renderTasks = () => {
    const filtered = filterTasks();
    taskList.innerHTML = "";
    emptyMessage.classList.toggle("hidden", filtered.length > 0);

    let list = [...filtered];
    if (sortSelect.value === "dueDate") {
      list.sort((a, b) => new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity));
    } else if (sortSelect.value === "priority") {
      const order = { high: 1, medium: 2, low: 3 };
      list.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    list.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.priority}`;
      if (task.completed) li.classList.add("completed");

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
      });

      const span = document.createElement("span");
      span.textContent = task.text;

      const meta = document.createElement("div");
      meta.className = "task-meta";
      meta.innerHTML = `
        <span class="task-category">${task.category}</span>
        ${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
      `;

      label.append(checkbox, span, meta);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.innerHTML = "✏️";
      editBtn.onclick = () => openEditModal(task);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.onclick = () => {
        tasks.splice(tasks.indexOf(task), 1);
        saveTasks();
        renderTasks();
      };

      actions.append(editBtn, deleteBtn);
      li.append(label, actions);
      taskList.appendChild(li);
    });
  };

  const openEditModal = (task) => {
    editIndex = tasks.indexOf(task);
    editText.value = task.text;
    editPriority.value = task.priority;
    editCategory.value = task.category;
    editDate.value = task.dueDate || "";
    editModal.classList.remove("hidden");
  };

  const closeEditModal = () => {
    editIndex = null;
    editForm.reset();
    editModal.classList.add("hidden");
  };

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      tasks[editIndex].text = editText.value.trim();
      tasks[editIndex].priority = editPriority.value;
      tasks[editIndex].category = editCategory.value;
      tasks[editIndex].dueDate = editDate.value;
      saveTasks();
      renderTasks();
      closeEditModal();
    }
  });

  cancelEdit.addEventListener("click", closeEditModal);

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newTask = {
      text: taskInput.value.trim(),
      priority: prioritySelect.value,
      category: categorySelect.value,
      dueDate: dueDateInput.value,
      completed: false,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
  });

  themeToggle.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  });

  sortSelect.addEventListener("change", renderTasks);
  searchInput.addEventListener("input", renderTasks);

  renderTasks();
});
