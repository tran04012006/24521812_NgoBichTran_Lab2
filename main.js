import {
  useState,
  registerRenderer,
  renderApp,
  getStateStore,
} from "./reactive-engine.js";

function TaskApp() {
  const [tasks, setTasks] = useState(["Review PR", "Verify AST"]);

  const [filter, setFilter] = useState("ALL");

  const container = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = `Tasks: ${tasks.length}`;

  const filterText = document.createElement("p");
  filterText.textContent = `Filter: ${filter}`;

  const addButton = document.createElement("button");
  addButton.textContent = "Add Task";

  addButton.addEventListener("click", () => {
    setTasks((prev) => [...prev, `Task ${prev.length + 1}`]);
  });

  const filterButton = document.createElement("button");
  filterButton.textContent = "Toggle Filter";

  filterButton.addEventListener("click", () => {
    setFilter((prev) => (prev === "ALL" ? "ACTIVE" : "ALL"));
  });

  container.append(heading, filterText, addButton, filterButton);

  return container;
}

const root = document.getElementById("app");

registerRenderer(() => {
  root.replaceChildren(TaskApp());

  console.log("State Store:", getStateStore());
});

renderApp();

function testStateEngine() {
  console.log("===== FIRST RENDER =====");

  renderApp();

  console.log("State Store:", getStateStore());

  // Simulate a state update
  updateState(0, ["Review PR", "Verify AST", "New Task"]);

  updateState(1, "ACTIVE");

  console.log("===== SECOND RENDER =====");

  renderApp();

  console.log("State Store:", getStateStore());
}

document.getElementById("testBtn").addEventListener("click", testStateEngine);
