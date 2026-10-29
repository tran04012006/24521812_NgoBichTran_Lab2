
# High-Concurrency Flash-Sale E-Commerce Engine

Homework 3 - Vietnam Flash Sale Simulation

## Overview

A Flash Sale simulation built with React,
TypeScript, and Vite.

Implemented features:
- Zero-drift Flash Sale countdown
- Inventory state machine
- Reservation with expiry
- Guarded asynchronous checkout
- Payment success/failure simulation
- Duplicate checkout protection
- Unit tests for race conditions

## Technology Stack

- React
- TypeScript
- Vite
- CSS
- Node.js
- tsx test runner

## Requirements

- Node.js compatible with the Vite project
- npm
- Git

## Getting Started

Install:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Unit Tests

All tests:

```bash
node --import tsx --test tests/*.test.mjs
```

Timer tests:

```bash
node --import tsx --test tests/anti-drift-timer.test.mjs
```

Inventory tests:

```bash
node --import tsx --test tests/inventory.test.mjs
```

Checkout tests:

```bash
node --import tsx --test tests/checkout.test.mjs
```

## Project Structure

```text
src/
  components/
    FlashSaleHeader.tsx
    ProductCard.tsx
    InventoryControls.css
  data/
    products.ts
  hooks/
    useCountdown.ts
    useInventory.ts
  services/
    inventoryStore.ts
  types/
    product.ts
    inventory.ts
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
  checkout.test.mjs
```

## Reservation Flow

1. User requests a reservation.
2. Inventory transitions to reserving.
3. Reservation succeeds if stock is available.
4. Available stock decreases.
5. Reservation receives an ID and expiry time.
6. User can checkout or release.
7. Expired reservation restores available stock.

## Checkout Flow

1. Validate reservation ID.
2. Validate reservation status.
3. Check expiration deadline.
4. Transition reserved -> checking_out.
5. Execute simulated payment asynchronously.
6. Recheck reservation status and deadline.
7. On success, transition to checked_out.
8. On payment failure, return to reserved
   if the reservation is still valid.
9. On expiry, restore available stock.

## Concurrency Scope

The current implementation blocks duplicate
checkout requests within a single JavaScript store.

It also prevents stale reservation IDs from
releasing current reservations.

This is NOT distributed transaction management.

## Production Requirements

A real Flash Sale system additionally requires:

- Server-authoritative inventory
- Authentication and authorization
- Atomic database stock updates
- Durable reservation records
- Idempotency keys
- Payment reconciliation and refunds
- Transaction recovery after crashes
- Load testing across multiple clients

## Known Limitations

- Inventory is stored in browser memory.
- Refreshing resets demo inventory.
- Different browsers have independent stores.
- Payment is simulated.
- Product reservations are not user-authenticated.
- Client clock is not server-authoritative.
- A successful mock payment is not a real charge.

## Task Progress

- [x] Task 1: Project Setup & Architecture
- [x] Task 2: Zero-Drift Countdown Timer
- [x] Task 3: Inventory State Machine
- [x] Task 4: Reservation & Checkout Integration
- [ ] Task 5: Testing & AI Failure Audit
- [ ] Task 6: Final Verification & Git Review

## Documentation

See task_decomposition.md for task checklists.
```
