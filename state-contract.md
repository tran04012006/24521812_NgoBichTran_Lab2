
# Custom useState Contract

## Function
useState(initialValue)

## Input
- initialValue: any JavaScript value

## Output
- [state, setState]

## Behavior
1. Use current cursor as the state index.
2. Initialize state only when the slot is empty.
3. Read the current value from stateStore.
4. Increment cursor once per useState call.
5. Return a setter bound to its original index.
6. Setter accepts a value or updater function.
7. Setter updates stateStore.
8. When state changes, trigger application re-render.
9. Before every render, reset cursor to zero.

## Constraints
- Preserve state between renders.
- Keep hook call order stable.
- No DOM event delegation in this milestone.
- Avoid direct mutations of arrays and objects.
