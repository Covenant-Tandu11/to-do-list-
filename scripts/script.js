/*DOM ELEMENTS*/
// Modal buttons
const openModalButton = document.getElementById("floating-add-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeModalButton = document.getElementById("close-modal");

// Modal form
const taskForm = document.getElementById("task-form");
const modalTaskInput = document.getElementById("modalTaskInput");
const taskCategorySelect = document.getElementById("task-category");

// Task list
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

// Category counts
const personalCount = document.getElementById("personal-count");
const workCount = document.getElementById("work-count");
const schoolCount = document.getElementById("school-count");
const healthCount = document.getElementById("health-count");

// Progress bars
const personalProgress = document.getElementById("personal-progress");
const workProgress = document.getElementById("work-progress");
const schoolProgress = document.getElementById("school-progress");
const healthProgress = document.getElementById("health-progress");

// Percent text
const personalPercent = document.getElementById("personal-percent");
const workPercent = document.getElementById("work-percent");
const schoolPercent = document.getElementById("school-percent");
const healthPercent = document.getElementById("health-percent");

// Category colors
const categoryColors = {
  personal: "#ff4fd8",
  work: "#4dd2ff",
  school: "#7bffb1",
  health: "#ffc46b"
};

/*LOCAL STORAGE HELPERS*/

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/*MODAL CONTROLS*/

openModalButton.addEventListener("click", () => {
  modalOverlay.classList.add("active");
});

closeModalButton.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("active");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modalOverlay.classList.remove("active");
  }
});

/*ADD TASK*/

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const taskText = modalTaskInput.value.trim();
  const taskCategory = taskCategorySelect.value;

  if (!taskText || !taskCategory) return;

  const tasks = getTasks();

  tasks.push({
    text: taskText,
    category: taskCategory,
    completed: false
  });

  saveTasks(tasks);
  renderTask(tasks[tasks.length - 1], tasks.length - 1);

  taskForm.reset();
  modalOverlay.classList.remove("active");
  toggleEmptyState();
  updateCountsAndProgress();
});

/*RENDER TASK*/

function renderTask(task, index) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.index = index;

  li.innerHTML = `
    <input type="checkbox" class="task-checkbox"
      ${task.completed ? "checked" : ""}
      style="border-color:${categoryColors[task.category]}; color:${categoryColors[task.category]};" />

    <span class="task-text"
      style="${task.completed ? "text-decoration:line-through; opacity:0.6;" : ""}">
      ${task.text}
    </span>

    <span class="task-category"
      style="background-color:${categoryColors[task.category]};">
      ${task.category}
    </span>

    <div class="task-actions">
      <button class="edit-btn"><i class="fas fa-edit"></i></button>
      <button class="delete-btn"><i class="fas fa-trash"></i></button>
    </div>
  `;

  const checkbox = li.querySelector(".task-checkbox");
  const textEl = li.querySelector(".task-text");

  checkbox.addEventListener("change", () => {
    const tasks = getTasks();
    tasks[index].completed = checkbox.checked;
    saveTasks(tasks);

    textEl.style.textDecoration = checkbox.checked ? "line-through" : "none";
    textEl.style.opacity = checkbox.checked ? "0.6" : "1";

    updateCountsAndProgress();
  });

  taskList.appendChild(li);
}

/*TASK ACTIONS*/

taskList.addEventListener("click", (e) => {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return;

  const index = taskItem.dataset.index;
  let tasks = getTasks();

  // DELETE
  if (e.target.closest(".delete-btn")) {
    tasks.splice(index, 1);
    saveTasks(tasks);
    taskItem.remove();
    reloadTasks();
  }

  // EDIT
  if (e.target.closest(".edit-btn")) {
    const newText = prompt("Edit task:", tasks[index].text);
    if (newText) {
      tasks[index].text = newText;
      saveTasks(tasks);
      reloadTasks();
    }
  }
});

/*RELOAD TASKS*/

function reloadTasks() {
  taskList.innerHTML = "";
  const tasks = getTasks();
  tasks.forEach((task, index) => renderTask(task, index));
  toggleEmptyState();
  updateCountsAndProgress();
}

/*EMPTY STATE*/

function toggleEmptyState() {
  const tasks = getTasks();
  emptyState.style.display = tasks.length === 0 ? "block" : "none";
}

/*COUNTS + PROGRESS*/

function updateCountsAndProgress() {
  const tasks = getTasks();

  const stats = {
    personal: { total: 0, done: 0 },
    work: { total: 0, done: 0 },
    school: { total: 0, done: 0 },
    health: { total: 0, done: 0 }
  };

  tasks.forEach(task => {
    stats[task.category].total++;
    if (task.completed) stats[task.category].done++;
  });

  updateCategory(stats.personal, personalCount, personalPercent, personalProgress);
  updateCategory(stats.work, workCount, workPercent, workProgress);
  updateCategory(stats.school, schoolCount, schoolPercent, schoolProgress);
  updateCategory(stats.health, healthCount, healthPercent, healthProgress);
}

function updateCategory(stat, countEl, percentEl, progressEl) {
  const { total, done } = stat;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  countEl.textContent = `${total} tasks`;
  percentEl.textContent = `${percent}%`;
  progressEl.style.width = percent + "%";
}


/*ON PAGE LOAD*/

document.addEventListener("DOMContentLoaded", () => {
  reloadTasks();
});