
import test from "node:test";
import assert from "node:assert/strict";

import {
  createInventoryStore,
} from "../src/services/inventoryStore.ts";

import {
  transitionInventory,
} from "../src/utils/inventoryMachine.ts";

const product = {
  id: "P001",
  name: "Test Product",
  description: "Inventory test",
  originalPrice: 100000,
  salePrice: 50000,
  stock: 1,
  sold: 0,
  icon: "📦",
};

function makeStore(duration = 30000) {
  return createInventoryStore([{ ...product }], duration);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("reserve decreases available stock", async () => {
  const store = makeStore();

  try {
    assert.equal(await store.reserve("P001"), true);

    const state = store.getSnapshot("P001");

    assert.equal(state.status, "reserved");
    assert.equal(state.availableStock, 0);
    assert.notEqual(state.reservationId, null);
  } finally {
    store.dispose();
  }
});

test("only one competing reserve succeeds", async () => {
  const store = makeStore();

  try {
    const results = await Promise.all([
      store.reserve("P001"),
      store.reserve("P001"),
    ]);

    assert.deepEqual(results, [true, false]);
    assert.equal(
      store.getSnapshot("P001").availableStock,
      0
    );
  } finally {
    store.dispose();
  }
});

test("checkout increments sold count", async () => {
  const store = makeStore();

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    const result = await store.checkout("P001", id);

    assert.deepEqual(result, { ok: true });

    const state = store.getSnapshot("P001");

    assert.equal(state.status, "checked_out");
    assert.equal(state.availableStock, 0);
    assert.equal(state.sold, 1);
  } finally {
    store.dispose();
  }
});

test("release returns inventory", async () => {
  const store = makeStore();

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    assert.equal(store.release("P001", id), true);

    const state = store.getSnapshot("P001");

    assert.equal(state.status, "available");
    assert.equal(state.availableStock, 1);
    assert.equal(state.sold, 0);
  } finally {
    store.dispose();
  }
});

test("automatic expiration restores stock", async () => {
  const store = makeStore(15);

  try {
    await store.reserve("P001");
    await sleep(40);

    const state = store.getSnapshot("P001");

    assert.equal(state.status, "expired");
    assert.equal(state.availableStock, 1);
  } finally {
    store.dispose();
  }
});

test("old reservation ID cannot release a new one", async () => {
  const store = makeStore();

  try {
    await store.reserve("P001");

    const oldId = store.getSnapshot("P001").reservationId;

    store.release("P001", oldId);
    await store.reserve("P001");

    const current = store.getSnapshot("P001");

    assert.notEqual(current.reservationId, oldId);
    assert.equal(store.release("P001", oldId), false);
    assert.equal(store.expire("P001", oldId), false);

    assert.equal(
      store.getSnapshot("P001").status,
      "reserved"
    );
  } finally {
    store.dispose();
  }
});

test("invalid checkout transition is rejected", () => {
  const store = makeStore();

  try {
    const state = store.getSnapshot("P001");

    assert.throws(() => {
      transitionInventory(state, {
        type: "CHECKOUT_REQUEST",
      });
    }, /Checkout requires reservation/);
  } finally {
    store.dispose();
  }
});

test("subscribers receive changes", async () => {
  const store = makeStore();

  try {
    let count = 0;

    const unsubscribe = store.subscribe(
      "P001",
      () => count++
    );

    await store.reserve("P001");

    assert.ok(count >= 2);

    const before = count;
    unsubscribe();

    const id = store.getSnapshot("P001").reservationId;
    store.release("P001", id);

    assert.equal(count, before);
  } finally {
    store.dispose();
  }
});

test("checkout after deadline is rejected", async () => {
  const store = makeStore(15);

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    await sleep(40);

    const result = await store.checkout("P001", id);

    assert.deepEqual(result, {
      ok: false,
      reason: "EXPIRED",
    });

    assert.equal(store.getSnapshot("P001").sold, 0);
  } finally {
    store.dispose();
  }
});
