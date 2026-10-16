# TASK_DECOMPOSITION.md

## Milestone 1: State Store & Reset Cursor Engine

### Task 1.1: Define State Store Contract

- [ ] Define stateStore as a persistent array.
- [ ] Define cursor as an integer index starting at 0.
- [ ] Specify state initialization, retrieval, and reset behavior.
- [ ] Document expected inputs, outputs, and edge cases.
- [ ] Verify the contract before coding.

### Task 1.2: Initialize State Store

- [ ] Create reactive-engine.js.
- [ ] Declare stateStore = [] at module scope.
- [ ] Verify the store persists across function calls.

### Task 1.3: Implement Cursor Tracking

- [ ] Declare cursor = 0 at module scope.
- [ ] Identify the current state index.
- [ ] Increment cursor exactly once per state access.
- [ ] Verify sequential accesses use different indices.

### Task 1.4: Implement State Initialization & Retrieval

- [ ] Implement temporary getState(initialValue).
- [ ] Initialize only uninitialized state slots.
- [ ] Return existing values on subsequent access.
- [ ] Handle undefined as a valid stored value.
- [ ] Do not implement reactive dispatch yet.

### Task 1.5: Implement resetCursor()

- [ ] Reset cursor to 0.
- [ ] Preserve stateStore contents.
- [ ] Verify reuse of indices across renders.

### Task 1.6: Independent Verification

- [ ] Test multiple sequential state accesses.
- [ ] Test initialization only once per slot.
- [ ] Test persistence across simulated renders.
- [ ] Test resetCursor without clearing state.
- [ ] Check Console and test results.
- [ ] Review git diff for unrelated changes.

### Task 1.7: Atomic Git Commit

- [ ] Stage only Milestone 1 changes.
- [ ] Create commit:
      feat(state): implement stateStore and resetCursor engine
- [ ] Verify git log -1.

## Workflow Rules

1. Functional slicing: isolated tasks.
2. Contract first: specify behavior before code.
3. Atomic generation: one task per AI prompt.
4. Independent verification: test before proceeding.
5. Do not implement Milestone 2, 3, or 4 here.

## Milestone 2: Reactive useState Dispatcher

### Task 2.1: Define useState Contract

- [ ] Define useState(initialValue) input.
- [ ] Define [state, setState] output.
- [ ] Define cursor and stateStore interaction.
- [ ] Specify setter behavior and re-render rules.

### Task 2.2: Implement useState Hook

- [ ] Reuse stateStore and cursor from Milestone 1.
- [ ] Initialize state only once per slot.
- [ ] Return [state, setState].
- [ ] Preserve the correct state index.

### Task 2.3: Implement State Setter

- [ ] Support setState(newValue).
- [ ] Support setState(prev => nextValue).
- [ ] Update the correct stateStore slot.
- [ ] Do not mutate previous array/object state.

### Task 2.4: Implement renderApp()

- [ ] Register the application component.
- [ ] Reset cursor before each render.
- [ ] Render the latest state to the DOM.

### Task 2.5: Connect Reactive Dispatcher

- [ ] Trigger renderApp() when state changes.
- [ ] Avoid unnecessary re-renders for unchanged values.
- [ ] Prevent accidental recursive rendering.

### Task 2.6: Independent Verification

- [ ] Verify initial state.
- [ ] Verify multiple independent states.
- [ ] Verify state persists after re-render.
- [ ] Verify setState automatically updates the DOM.
- [ ] Verify functional updater.
- [ ] Inspect browser Console and DevTools.
- [ ] Review git diff.

### Task 2.7: Atomic Git Commit

- [ ] Stage only Milestone 2 changes.
- [ ] Commit:
      feat(state): implement reactive useState dispatcher
- [ ] Verify git log -1.

RULE: Implement and verify only one sub-task at a time.

## Milestone 3: Root Event Delegation

### Task 3.1: Define Event Delegation Contract

- [ ] Define root element (#app).
- [ ] Define click as the delegated event type.
- [ ] Define data-action for actionable elements.
- [ ] Define action-to-handler mapping.
- [ ] Specify how unknown actions are ignored.
- [ ] Specify behavior for nested elements and clicks outside root.

### Task 3.2: Design Action Attributes

- [ ] Add data-action="add-task" to Add Task button.
- [ ] Add data-action="toggle-filter" to Toggle Filter button.
- [ ] Use consistent action names.
- [ ] Remove individual button click listeners
      when delegation is activated.
- [ ] Verify buttons render with correct attributes.

### Task 3.3: Implement Root Click Listener

- [ ] Create attachRootEvents(root, handlers).
- [ ] Validate root and handlers.
- [ ] Register one click listener on root.
- [ ] Ensure listener is not duplicated after re-renders.
- [ ] Keep listener attached when child DOM is replaced.

### Task 3.4: Implement Action Dispatcher

- [ ] Use event.target.closest("[data-action]").
- [ ] Verify the matched element belongs to root.
- [ ] Read the data-action value.
- [ ] Map action to the correct handler.
- [ ] Ignore unknown actions safely.
- [ ] Support clicks on nested button content.

### Task 3.5: Integrate with Reactive useState

- [ ] Connect add-task action with setTasks().
- [ ] Connect toggle-filter action with setFilter().
- [ ] Preserve correct state indexes.
- [ ] Verify setState triggers renderApp().
- [ ] Verify new DOM buttons still work.

### Task 3.6: Independent Verification

- [ ] Test Add Task multiple times.
- [ ] Test Toggle Filter multiple times.
- [ ] Test clicking nested button elements.
- [ ] Test unknown actions.
- [ ] Verify no per-button listeners remain.
- [ ] Verify root has one delegated click listener.
- [ ] Check DevTools Elements and Console.
- [ ] Check git diff for unrelated changes.

### Task 3.7: Atomic Git Commit

- [ ] Stage only Milestone 3 changes.
- [ ] Create commit:
      feat(events): attach root event delegation listener
- [ ] Verify git log -1.

## Workflow Rules

1. Follow Functional Slicing.
2. Define contract before implementation.
3. Ask AI to implement only one sub-task at a time.
4. Test every task independently.
5. Do not implement full Task Manager UI yet.
6. Do not create additional listeners during re-render.

## Milestone 4: Reactive Task Manager UI

### Task 4.1: Define Task Manager Contract

- [ ] Define Task object structure:
      { id, title, completed }
- [ ] Define tasks state as an array.
- [ ] Define filter state: ALL, ACTIVE, COMPLETED.
- [ ] Specify Add Task behavior.
- [ ] Specify Toggle Task behavior.
- [ ] Specify Filter behavior.
- [ ] Define expected UI updates.

### Task 4.2: Implement Task List Rendering

- [ ] Create a task list container.
- [ ] Render tasks using DOM APIs.
- [ ] Show each task title.
- [ ] Display completion status.
- [ ] Display total task count.
- [ ] Handle an empty task list.
- [ ] Verify DOM structure in DevTools.

### Task 4.3: Implement Add Task UI

- [ ] Create input for task title.
- [ ] Create Add Task button.
- [ ] Add data-action="add-task".
- [ ] Read and trim input value.
- [ ] Reject empty task titles.
- [ ] Generate a unique task ID.
- [ ] Update state immutably using setTasks().
- [ ] Verify UI updates automatically.

### Task 4.4: Implement Task Status Toggle

- [ ] Add a status control to each task.
- [ ] Attach data-action="toggle-task".
- [ ] Attach data-id to identify the task.
- [ ] Locate the selected task by ID.
- [ ] Toggle its completed property.
- [ ] Update tasks immutably.
- [ ] Verify correct status after re-render.

### Task 4.5: Implement Dynamic Filters

- [ ] Create ALL filter button.
- [ ] Create ACTIVE filter button.
- [ ] Create COMPLETED filter button.
- [ ] Add data-action="set-filter".
- [ ] Add data-filter attributes.
- [ ] Update state using setFilter().
- [ ] Filter visible tasks without mutating state.
- [ ] Display the currently selected filter.
- [ ] Verify filtering after adding/toggling tasks.

### Task 4.6: Integrate Reactive Rendering & Delegation

- [ ] Reuse custom useState() from Milestone 2.
- [ ] Reuse root listener from Milestone 3.
- [ ] Define delegated action handlers.
- [ ] Handle Add Task through root delegation.
- [ ] Handle Toggle Task through root delegation.
- [ ] Handle filter actions through root delegation.
- [ ] Verify state changes trigger renderApp().
- [ ] Verify newly rendered buttons still work.
- [ ] Preserve input behavior across re-renders.

### Task 4.7: Independent Verification

- [ ] Test initial tasks and task count.
- [ ] Test adding one or multiple tasks.
- [ ] Test empty and whitespace-only input.
- [ ] Test toggling task completion.
- [ ] Test ALL / ACTIVE / COMPLETED filters.
- [ ] Test updates while a filter is active.
- [ ] Verify state persistence across renders.
- [ ] Verify no duplicate root listeners.
- [ ] Inspect DevTools Elements and Console.
- [ ] Review git diff for unrelated changes.

### Task 4.8: Atomic Git Commit

- [ ] Stage only Milestone 4 changes.
- [ ] Commit:
      feat(ui): assemble reactive todo application
- [ ] Verify git log -1.

## Workflow Rules

1. Follow Functional Slicing.
2. Define contract before implementation.
3. Implement exactly one sub-task per AI prompt.
4. Verify each task before moving forward.
5. Reuse the existing state and event engines.
6. Do not recreate React or add external frameworks.
7. Create one atomic commit for Milestone 4.
