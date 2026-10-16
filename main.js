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
  const [tasks, setTasks] = useState(["Review PR", "Verify AST"]);

  const [filter, setFilter] = useState("ALL");

  // Register action handlers
  actionHandlers["add-task"] = () => {
    setTasks((prev) => [...prev, `Task ${prev.length + 1}`]);
  };

  actionHandlers["toggle-filter"] = () => {
    setFilter((prev) => (prev === "ALL" ? "ACTIVE" : "ALL"));
  };

  // Create UI
  const container = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = `Tasks: ${tasks.length}`;

  const filterText = document.createElement("p");
  filterText.textContent = `Filter: ${filter}`;

  // Add Task button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Task";
  addButton.dataset.action = "add-task";

  // Toggle Filter button
  const filterButton = document.createElement("button");
  filterButton.textContent = "Toggle Filter";
  filterButton.dataset.action = "toggle-filter";

  container.append(heading, filterText, addButton, filterButton);

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
