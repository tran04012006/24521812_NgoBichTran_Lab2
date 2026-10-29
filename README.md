
# High-Concurrency Flash-Sale E-Commerce Engine

Homework 3 - Vietnam Flash Sale Simulation

## Overview

A Flash Sale simulation using React, TypeScript
and Vite.

Main topics:
- Zero-drift countdown
- Inventory reservation state machine
- Concurrency control simulation
- Reservation expiration
- Checkout
- AI failure mode audit

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Node.js
- tsx test runner

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Unit Tests

Timer tests:

```bash
node --import tsx --test tests/anti-drift-timer.test.mjs
```

Inventory tests:

```bash
node --import tsx --test tests/inventory.test.mjs
```

Run all tests:

```bash
node --import tsx --test tests/*.test.mjs
```

## Project Structure

```text
src/
  components/
    FlashSaleHeader.tsx
    InventoryControls.css
    ProductCard.tsx
  data/
    products.ts
  hooks/
    useCountdown.ts
    useInventory.ts
  services/
    inventoryStore.ts
  types/
    inventory.ts
    product.ts
  utils/
    anti-drift-timer.ts
    inventoryMachine.ts
    time.ts
  App.tsx
  App.css
  index.css
  main.tsx

tests/
  anti-drift-timer.test.mjs
  inventory.test.mjs
```

## Inventory State Machine

Supported states:

- available
- reserving
- reserved
- expired
- checked_out

Main transitions:

available -> reserving -> reserved

reserved -> expired
reserved -> available (release)
reserved -> checked_out

expired -> reserving
checked_out -> reserving (if stock remains)

Reservation duration: 30 seconds.

## Inventory Rules

1. A product must have stock before reservation.
2. A product cannot be reserved twice while pending.
3. Reservation confirmation decreases available stock.
4. Expiration restores available stock.
5. Checkout requires a valid reservation.
6. Checkout increases the sold count.
7. Old reservation timeouts cannot release new ones.

## Scope and Limitations

Inventory is stored in browser memory.

Each browser has an independent store.
Refreshing the page resets demo inventory.

This implementation demonstrates state transitions
and concurrency within one JavaScript store.

It is not a production-grade distributed inventory
locking solution.

Real e-commerce concurrency requires:
- Server-authoritative stock
- Atomic database operations
- Reservation ownership validation
- Idempotent checkout
- Consistent payment and order processing

The current checkout only simulates success.

## Task Progress

- [x] Task 1: Project Setup & Architecture
- [x] Task 2: Zero-Drift Countdown Timer
- [x] Task 3: Inventory State Machine
- [ ] Task 4: Reservation & Checkout Integration
- [ ] Task 5: Testing & AI Failure Audit
- [ ] Task 6: Final Verification & Git Review

## Documentation

See task_decomposition.md for task checklists.
```
