
import {
  resetCursor,
  getState,
  updateState,
  getStateStore
} from "./reactive-engine.js";

// Simulated application component
function TaskApp() {
  const tasks = getState(["Review PR", "Verify AST"]);
  const filter = getState("ALL");

  console.log("Tasks:", tasks);
  console.log("Filter:", filter);
}

// Simulate a render
function renderApp() {
  resetCursor();
  TaskApp();
}

function testStateEngine() {
  console.log("===== FIRST RENDER =====");

  renderApp();

  console.log("State Store:", getStateStore());

  // Simulate a state update
  updateState(0, [
    "Review PR",
    "Verify AST",
    "New Task"
  ]);

  updateState(1, "ACTIVE");

  console.log("===== SECOND RENDER =====");

  renderApp();

  console.log("State Store:", getStateStore());
}

document
  .getElementById("testBtn")
  .addEventListener("click", testStateEngine);
