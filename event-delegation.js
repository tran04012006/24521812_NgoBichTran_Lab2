
export function attachRootEvents(root, handlers) {
  if (!(root instanceof Element)) {
    throw new TypeError("Root must be a DOM element");
  }

  if (!handlers || typeof handlers !== "object") {
    throw new TypeError("Handlers must be an object");
  }

  const handleClick = (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest("button[data-action]");

    // Ignore clicks outside actionable buttons
    if (!button || !root.contains(button)) {
      return;
    }

    const action = button.dataset.action;
    const handler = handlers[action];

    // Ignore unknown actions
    if (typeof handler !== "function") {
      return;
    }

    handler(event, button);
  };

  root.addEventListener("click", handleClick);

  // Allow cleanup if needed
  return () => {
    root.removeEventListener("click", handleClick);
  };
}
