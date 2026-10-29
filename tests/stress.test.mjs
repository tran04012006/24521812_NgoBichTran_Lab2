
import test from "node:test";
import assert from "node:assert/strict";

import {
  createInventoryStore,
} from "../src/services/inventoryStore.ts";

function makeProduct(
  id = "P001",
  stock = 1
) {
  return {
    id,
    name: `Product ${id}`,
    description: "Stress testing product",
    originalPrice: 100000,
    salePrice: 50000,
    stock,
    sold: 0,
    icon: "📦",
  };
}

function createDeferred() {
  let resolve;

  const promise = new Promise((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

test(
  "100 competing reservations accept only one",
  async () => {
    const store = createInventoryStore(
      [makeProduct("P001", 1)]
    );

    try {
      const requests = Array.from(
        { length: 100 },
        () => store.reserve("P001")
      );

      const results = await Promise.all(requests);

      const accepted = results.filter(Boolean).length;
      const rejected = results.length - accepted;

      assert.equal(accepted, 1);
      assert.equal(rejected, 99);

      const state = store.getSnapshot("P001");

      assert.equal(state.status, "reserved");
      assert.equal(state.availableStock, 0);
      assert.equal(state.sold, 0);
    } finally {
      store.dispose();
    }
  }
);

test(
  "parallel reservations of different products are isolated",
  async () => {
    const products = Array.from(
      { length: 20 },
      (_, index) => makeProduct(`P${index}`, 1)
    );

    const store = createInventoryStore(products);

    try {
      const results = await Promise.all(
        products.map((product) =>
          store.reserve(product.id)
        )
      );

      assert.equal(
        results.filter(Boolean).length,
        20
      );

      for (const product of products) {
        const state = store.getSnapshot(product.id);

        assert.equal(state.status, "reserved");
        assert.equal(state.availableStock, 0);
      }
    } finally {
      store.dispose();
    }
  }
);

test(
  "100 competing checkouts commit only once",
  async () => {
    const payment = createDeferred();
    let paymentCalls = 0;

    const store = createInventoryStore(
      [makeProduct()],
      30000,
      () => {
        paymentCalls++;
        return payment.promise;
      }
    );

    try {
      await store.reserve("P001");

      const id =
        store.getSnapshot("P001").reservationId;

      assert.ok(id);

      const requests = Array.from(
        { length: 100 },
        () => store.checkout("P001", id)
      );

      const resultsPromise = Promise.all(requests);

      assert.equal(paymentCalls, 1);

      payment.resolve(true);

      const results = await resultsPromise;

      assert.equal(
        results.filter((result) => result.ok).length,
        1
      );

      assert.equal(
        results.filter(
          (result) =>
            !result.ok &&
            result.reason === "ALREADY_PROCESSING"
        ).length,
        99
      );

      const state = store.getSnapshot("P001");

      assert.equal(state.status, "checked_out");
      assert.equal(state.sold, 1);
      assert.equal(state.availableStock, 0);
    } finally {
      store.dispose();
    }
  }
);

test(
  "payment rejection does not consume stock twice",
  async () => {
    let attempts = 0;

    const store = createInventoryStore(
      [makeProduct()],
      30000,
      async () => {
        attempts++;

        if (attempts === 1) {
          throw new Error("Simulated payment error");
        }

        return true;
      }
    );

    try {
      await store.reserve("P001");

      const id =
        store.getSnapshot("P001").reservationId;

      assert.ok(id);

      const first = await store.checkout("P001", id);

      assert.deepEqual(first, {
        ok: false,
        reason: "PAYMENT_FAILED",
      });

      assert.equal(
        store.getSnapshot("P001").status,
        "reserved"
      );

      assert.equal(
        store.getSnapshot("P001").sold,
        0
      );

      const second = await store.checkout("P001", id);

      assert.deepEqual(second, { ok: true });

      assert.equal(
        store.getSnapshot("P001").sold,
        1
      );
    } finally {
      store.dispose();
    }
  }
);

test(
  "releasing inventory never increases original quantity",
  async () => {
    const store = createInventoryStore(
      [makeProduct("P001", 3)]
    );

    try {
      for (let index = 0; index < 20; index++) {
        const reserved = await store.reserve("P001");

        assert.equal(reserved, true);

        const id =
          store.getSnapshot("P001").reservationId;

        assert.ok(id);
        assert.equal(store.release("P001", id), true);

        assert.equal(
          store.getSnapshot("P001").availableStock,
          3
        );
      }

      const state = store.getSnapshot("P001");

      assert.equal(state.sold, 0);
      assert.equal(state.availableStock, 3);
    } finally {
      store.dispose();
    }
  }
);

test(
  "stale reservation cannot release current inventory",
  async () => {
    const store = createInventoryStore(
      [makeProduct()]
    );

    try {
      await store.reserve("P001");

      const previousId =
        store.getSnapshot("P001").reservationId;

      assert.ok(previousId);

      assert.equal(
        store.release("P001", previousId),
        true
      );

      await store.reserve("P001");

      const currentId =
        store.getSnapshot("P001").reservationId;

      assert.ok(currentId);
      assert.notEqual(currentId, previousId);

      assert.equal(
        store.release("P001", previousId),
        false
      );

      assert.equal(
        store.getSnapshot("P001").reservationId,
        currentId
      );

      assert.equal(
        store.getSnapshot("P001").availableStock,
        0
      );
    } finally {
      store.dispose();
    }
  }
);

test(
  "disposed store rejects new transactions",
  async () => {
    const store = createInventoryStore(
      [makeProduct()]
    );

    store.dispose();

    assert.equal(
      await store.reserve("P001"),
      false
    );

    assert.deepEqual(
      await store.checkout("P001", "any-id"),
      {
        ok: false,
        reason: "STORE_DISPOSED",
      }
    );

    assert.equal(
      store.release("P001", "any-id"),
      false
    );
  }
);
