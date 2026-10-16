const stateStore = [];
let cursor = 0;
let renderCallback = null;
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

export function registerRenderer(callback) {
  if (typeof callback !== "function") {
    throw new TypeError("Renderer must be a function");
  }

  renderCallback = callback;
}

export function useState(initialValue) {
  const index = cursor;

  if (!(index in stateStore)) {
    stateStore[index] = initialValue;
  }

  cursor++;

  const setState = (value) => {
    const previousState = stateStore[index];

    const nextState =
      typeof value === "function" ? value(previousState) : value;

    if (Object.is(previousState, nextState)) {
      return;
    }

    stateStore[index] = nextState;
    renderApp();
  };

  return [stateStore[index], setState];
}

let isRendering = false;

export function renderApp() {
  if (!renderCallback || isRendering) {
    return;
  }

  isRendering = true;

  try {
    resetCursor();
    renderCallback();
  } finally {
    isRendering = false;
  }
}
