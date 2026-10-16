
const stateStore = [];
let cursor = 0;

// Reset cursor before each render
export function resetCursor() {
  cursor = 0;
}

// Read state from the store
export function getState(initialValue) {
  const index = cursor;

  // Initialize only if state does not exist
  if (!(index in stateStore)) {
    stateStore[index] = initialValue;
  }

  // Move to the next state position
  cursor++;

  return stateStore[index];
}

// Update state at a specific index (for testing)
export function updateState(index, newValue) {
  if (!(index in stateStore)) {
    throw new Error("State index does not exist");
  }

  stateStore[index] = newValue;
}

// View current state store
export function getStateStore() {
  return [...stateStore];
}
