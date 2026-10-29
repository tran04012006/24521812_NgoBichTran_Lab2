
# High-Concurrency Flash-Sale E-Commerce Engine

Homework 3 - Vietnam Flash Sale Simulation

## Project Overview

A Flash Sale E-Commerce simulation built with
React, TypeScript, and Vite.

The project focuses on:

- Zero-drift countdown timer
- Inventory reservation state machine
- High-concurrency scenarios
- Checkout flow
- AI failure mode audit

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Node.js built-in test runner

## Requirements

- Node.js 22.12+ for the Task 2 test command
- npm
- Git

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Tests

```bash
node --experimental-strip-types --test tests/anti-drift-timer.test.mjs
```

## Project Structure

```text
src/
  components/
    FlashSaleHeader.tsx
    ProductCard.tsx
  data/
    products.ts
  hooks/
    useCountdown.ts
  types/
    product.ts
  utils/
    anti-drift-timer.ts
    time.ts
  App.tsx
  App.css
  index.css
  main.tsx

tests/
  anti-drift-timer.test.mjs
```

## Task Progress

- [x] Task 1: Project Setup & Architecture
- [x] Task 2: Zero-Drift Countdown Timer
- [ ] Task 3: Inventory State Machine
- [ ] Task 4: Reservation and Checkout Integration
- [ ] Task 5: Testing and AI Failure Audit
- [ ] Task 6: Final Verification and Git Review

## Timer Architecture

The anti-drift timer uses an absolute target timestamp.

remainingMs = max(0, targetTime - Date.now())

requestAnimationFrame schedules visual updates,
but does not determine elapsed time.

The timer supports:
- Start
- Pause
- Resume
- Restart
- Stop
- Completion callback

The useCountdown hook integrates the timer
with React state and component lifecycle.

## Task 2 Limitations

- The countdown uses the client computer clock.
- Pause and Restart are development/demo controls.
- The timer starts again on a full page reload.
- Inventory reservation and checkout are not yet active.
- Real Flash Sale deadlines should be server-authoritative.

## Notes

This project simulates a Vietnam 11.11 Flash Sale.

See task_decomposition.md for detailed progress.
```
