import {
  useState,
  registerRenderer,
  renderApp,
  getStateStore,
} from "./reactive-engine.js";

import { attachRootEvents } from "./event-delegation.js";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Cannot find #app element");
}

// Shared action handlers
const actionHandlers = {};

function TaskApp() {
  const taskInput = document.createElement("input");

  taskInput.type = "text";
  taskInput.id = "task-input";
  taskInput.placeholder = "Enter task title";
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review PR",
      completed: false,
    },
    {
      id: 2,
      title: "Verify AST",
      completed: false,
    },
  ]);
  const [filter, setFilter] = useState("ALL");

  // Register action handlers

  actionHandlers["add-task"] = () => {
    const input = root.querySelector("#task-input");

    const title = input.value.trim();

    if (!title) {
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: title,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  actionHandlers["set-filter"] = (event, button) => {
    const selectedFilter = button.dataset.filter;

    if (["ALL", "ACTIVE", "COMPLETED"].includes(selectedFilter)) {
      setFilter(selectedFilter);
    }
  };
  // Create UI
  const container = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = `Tasks: ${tasks.length}`;

  const taskList = document.createElement("ul");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") {
      return !task.completed;
    }

    if (filter === "COMPLETED") {
      return task.completed;
    }

    return true;
  });

  filteredTasks.forEach((task) => {
    const item = document.createElement("li");

    const taskButton = document.createElement("button");

    taskButton.type = "button";
    taskButton.textContent = task.title;

    // Event Delegation
    taskButton.dataset.action = "toggle-task";
    taskButton.dataset.id = String(task.id);

    if (task.completed) {
      taskButton.style.textDecoration = "line-through";
    }

    item.appendChild(taskButton);
    taskList.appendChild(item);
  });

  const filterText = document.createElement("p");
  filterText.textContent = `Filter: ${filter}`;

  // Add Task button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Task";
  addButton.dataset.action = "add-task";

  // Toggle Filter button
  const filterContainer = document.createElement("div");
  ["ALL", "ACTIVE", "COMPLETED"].forEach((value) => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = value;
    button.dataset.action = "set-filter";
    button.dataset.filter = value;

    if (filter === value) {
      button.classList.add("active");
    }

    filterContainer.appendChild(button);
  });
  filterContainer.textContent = "Toggle Filter";
  filterContainer.dataset.action = "toggle-filter";

  container.append(
    heading,
    filterText,
    taskInput,
    addButton,
    filterContainer,
    taskList,
  );

  actionHandlers["toggle-task"] = (event, button) => {
    const taskId = button.dataset.id;

    setTasks((prev) =>
      prev.map((task) => {
        if (String(task.id) === taskId) {
          return {
            ...task,
            completed: !task.completed,
          };
        }

        return task;
      }),
    );
  };

  return container;
}

// Register rendering callback
registerRenderer(() => {
  root.replaceChildren(TaskApp());

  console.log("State Store:", getStateStore());
});

// Attach root event listener ONCE
attachRootEvents(root, actionHandlers);

// First render
renderApp();
