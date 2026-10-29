
import type { Product } from "../types/product";

import type {
  InventorySnapshot,
} from "../types/inventory";

import {
  transitionInventory,
} from "../utils/inventoryMachine";

type Listener = () => void;

export interface InventoryStore {
  getSnapshot: (productId: string) => InventorySnapshot;
  subscribe: (
    productId: string,
    listener: Listener
  ) => () => void;
  reserve: (productId: string) => Promise<boolean>;
  checkout: (productId: string) => boolean;
  release: (productId: string) => boolean;
  expire: (
    productId: string,
    reservationId: string
  ) => boolean;
  dispose: () => void;
}

export function createInventoryStore(
  products: Product[],
  reservationDurationMs = 30_000
): InventoryStore {
  if (
    !Number.isFinite(reservationDurationMs) ||
    reservationDurationMs <= 0
  ) {
    throw new Error("Invalid reservation duration");
  }

  const states = new Map<string, InventorySnapshot>();
  const listeners = new Map<string, Set<Listener>>();
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  let nextReservationId = 1;
  let disposed = false;

  for (const product of products) {
    if (
      states.has(product.id) ||
      !Number.isSafeInteger(product.stock) ||
      product.stock < 0 ||
      !Number.isSafeInteger(product.sold) ||
      product.sold < 0
    ) {
      throw new Error("Invalid inventory product data");
    }

    states.set(product.id, {
      productId: product.id,
      status: "available",
      availableStock: product.stock,
      sold: product.sold,
      reservationId: null,
      expiresAt: null,
    });

    listeners.set(product.id, new Set());
  }

  function getSnapshot(productId: string): InventorySnapshot {
    const state = states.get(productId);

    if (!state) {
      throw new Error(`Unknown product: ${productId}`);
    }

    return state;
  }

  function publish(
    productId: string,
    nextState: InventorySnapshot
  ): void {
    states.set(productId, nextState);

    listeners.get(productId)?.forEach((listener) => {
      listener();
    });
  }

  function clearExpiry(productId: string): void {
    const timeout = timeouts.get(productId);

    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeouts.delete(productId);
    }
  }

  function expire(
    productId: string,
    reservationId: string
  ): boolean {
    if (disposed) return false;

    const state = getSnapshot(productId);

    if (
      state.status !== "reserved" ||
      state.reservationId !== reservationId
    ) {
      return false;
    }

    clearExpiry(productId);

    publish(
      productId,
      transitionInventory(state, {
        type: "RESERVATION_EXPIRED",
      })
    );

    return true;
  }

  function expireIfNeeded(productId: string): void {
    const state = getSnapshot(productId);

    if (
      state.status === "reserved" &&
      state.expiresAt !== null &&
      Date.now() >= state.expiresAt &&
      state.reservationId !== null
    ) {
      expire(productId, state.reservationId);
    }
  }

  async function reserve(
    productId: string
  ): Promise<boolean> {
    if (disposed) return false;

    expireIfNeeded(productId);

    const current = getSnapshot(productId);

    try {
      const pending = transitionInventory(current, {
        type: "RESERVE_REQUEST",
      });

      publish(productId, pending);
    } catch {
      return false;
    }

    // Simulate an asynchronous server response.
    await Promise.resolve();

    if (disposed) return false;

    const pending = getSnapshot(productId);

    if (pending.status !== "reserving") {
      return false;
    }

    const reservationId =
      `reservation-${nextReservationId++}`;

    const expiresAt =
      Date.now() + reservationDurationMs;

    const reserved = transitionInventory(pending, {
      type: "RESERVE_SUCCESS",
      reservationId,
      expiresAt,
    });

    publish(productId, reserved);

    const timeout = setTimeout(() => {
      expire(productId, reservationId);
    }, reservationDurationMs);

    timeouts.set(productId, timeout);

    return true;
  }

  function checkout(productId: string): boolean {
    if (disposed) return false;

    expireIfNeeded(productId);

    const state = getSnapshot(productId);

    if (state.status !== "reserved") {
      return false;
    }

    clearExpiry(productId);

    publish(
      productId,
      transitionInventory(state, {
        type: "CHECKOUT_SUCCESS",
      })
    );

    return true;
  }

  function release(productId: string): boolean {
    if (disposed) return false;

    expireIfNeeded(productId);

    const state = getSnapshot(productId);

    if (state.status !== "reserved") {
      return false;
    }

    clearExpiry(productId);

    publish(
      productId,
      transitionInventory(state, {
        type: "RELEASE",
      })
    );

    return true;
  }

  function subscribe(
    productId: string,
    listener: Listener
  ): () => void {
    if (disposed) return () => {};

    const productListeners = listeners.get(productId);

    if (!productListeners) {
      throw new Error(`Unknown product: ${productId}`);
    }

    productListeners.add(listener);

    return () => {
      productListeners.delete(listener);
    };
  }

  function dispose(): void {
    if (disposed) return;

    disposed = true;

    for (const timeout of timeouts.values()) {
      clearTimeout(timeout);
    }

    timeouts.clear();
    listeners.clear();
  }

  return {
    getSnapshot,
    subscribe,
    reserve,
    checkout,
    release,
    expire,
    dispose,
  };
}
