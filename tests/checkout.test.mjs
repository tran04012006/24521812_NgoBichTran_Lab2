
import test from "node:test";
import assert from "node:assert/strict";

import {
  createInventoryStore,
} from "../src/services/inventoryStore.ts";

const product = {
  id: "P001",
  name: "Test Product",
  description: "Checkout test",
  originalPrice: 100000,
  salePrice: 50000,
  stock: 1,
  sold: 0,
  icon: "📦",
};

function deferred() {
  let resolve;

  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("duplicate checkout is blocked", async () => {
  const payment = deferred();

  const store = createInventoryStore(
    [product],
    30000,
    () => payment.promise
  );

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    const first = store.checkout("P001", id);
    const second = await store.checkout("P001", id);

    assert.deepEqual(second, {
      ok: false,
      reason: "ALREADY_PROCESSING",
    });

    assert.equal(
      store.getSnapshot("P001").status,
      "checking_out"
    );

    payment.resolve(true);

    assert.deepEqual(await first, { ok: true });
    assert.equal(store.getSnapshot("P001").sold, 1);
  } finally {
    store.dispose();
  }
});

test("payment failure permits retry", async () => {
  let attempts = 0;

  const store = createInventoryStore(
    [product],
    30000,
    async () => {
      attempts++;
      return attempts > 1;
    }
  );

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    const first = await store.checkout("P001", id);

    assert.deepEqual(first, {
      ok: false,
      reason: "PAYMENT_FAILED",
    });

    assert.equal(
      store.getSnapshot("P001").status,
      "reserved"
    );

    const second = await store.checkout("P001", id);

    assert.deepEqual(second, { ok: true });
    assert.equal(store.getSnapshot("P001").sold, 1);
  } finally {
    store.dispose();
  }
});

test("wrong reservation ID is rejected", async () => {
  const store = createInventoryStore([product]);

  try {
    await store.reserve("P001");

    const result = await store.checkout(
      "P001",
      "incorrect-reservation"
    );

    assert.deepEqual(result, {
      ok: false,
      reason: "INVALID_RESERVATION",
    });

    assert.equal(
      store.getSnapshot("P001").status,
      "reserved"
    );
  } finally {
    store.dispose();
  }
});

test("reservation expires during payment", async () => {
  const payment = deferred();

  const store = createInventoryStore(
    [product],
    20,
    () => payment.promise
  );

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    const checkoutPromise = store.checkout("P001", id);

    await sleep(50);

    assert.equal(
      store.getSnapshot("P001").status,
      "expired"
    );

    payment.resolve(true);

    const result = await checkoutPromise;

    assert.deepEqual(result, {
      ok: false,
      reason: "EXPIRED",
    });

    assert.equal(
      store.getSnapshot("P001").availableStock,
      1
    );

    assert.equal(store.getSnapshot("P001").sold, 0);
  } finally {
    store.dispose();
  }
});

test("cannot release while payment is processing", async () => {
  const payment = deferred();

  const store = createInventoryStore(
    [product],
    30000,
    () => payment.promise
  );

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    const pending = store.checkout("P001", id);

    assert.equal(store.release("P001", id), false);

    payment.resolve(true);

    assert.deepEqual(await pending, { ok: true });
  } finally {
    store.dispose();
  }
});

test("checkout after success cannot increment sold twice", async () => {
  const store = createInventoryStore([product]);

  try {
    await store.reserve("P001");

    const id = store.getSnapshot("P001").reservationId;

    assert.deepEqual(
      await store.checkout("P001", id),
      { ok: true }
    );

    const second = await store.checkout("P001", id);

    assert.deepEqual(second, {
      ok: false,
      reason: "INVALID_RESERVATION",
    });

    assert.equal(store.getSnapshot("P001").sold, 1);
  } finally {
    store.dispose();
  }
});

test("disposed store does not complete pending payment", async () => {
  const payment = deferred();

  const store = createInventoryStore(
    [product],
    30000,
    () => payment.promise
  );

  await store.reserve("P001");

  const id = store.getSnapshot("P001").reservationId;
  const pending = store.checkout("P001", id);

  store.dispose();

  payment.resolve(true);

  const result = await pending;

  assert.deepEqual(result, {
    ok: false,
    reason: "STORE_DISPOSED",
  });
});
