Exercise 1: Mini-React VNode & Mounting Engine
│
├── Task 1: Project Setup
│ ├── 1.1. Create project folder
│ ├── 1.2. Create index.html
│ ├── 1.3. Create mini-react.js
│ └── 1.4. Set up test-runner.js
│
├── Task 2: Implement VNode Factory
│ ├── 2.1. Define VNode structure
│ ├── 2.2. Implement createTextElement()
│ ├── 2.3. Implement createElement()
│ ├── 2.4. Handle props and children
│ ├── 2.5. Convert text children into Text VNodes
│ ├── 2.6. Implement strict VNode typeguard
│ └── 2.7. Git Commit 1
│ └── feat(core): implement createElement factory
│
├── Task 3: Implement DOM Mounting Engine
│ ├── 3.1. Implement renderToDOM()
│ ├── 3.2. Create HTML elements
│ ├── 3.3. Create text nodes
│ ├── 3.4. Handle DOM attributes and props
│ ├── 3.5. Handle event listeners (onClick)
│ ├── 3.6. Recursively render children
│ └── 3.7. Mount DOM into root container
│
├── Task 4: Testing & Verification
│ ├── 4.1. Run test-runner.js
│ ├── 4.2. Verify VNode structure
│ ├── 4.3. Verify semantic HTML elements
│ ├── 4.4. Test button click events
│ ├── 4.5. Test XSS protection
│ ├── 4.6. Test strict typeguard
│ └── 4.7. Inspect DOM using DevTools
│ ├── Verify DOM matches VNode tree
│ ├── Ensure zero div-soup
│ └── Ensure no orphan nodes
│
└── Task 5: Finalization
├── 5.1. Fix identified issues
├── 5.2. Capture DevTools evidence
├── 5.3. Git Commit 2
│ └── feat(core): implement renderToDOM
└── 5.4. Verify Git commit history
