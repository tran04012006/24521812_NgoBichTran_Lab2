
import type { Product } from "../types/product";

import type {
  CheckoutResult,
  InventorySnapshot,
  PaymentProcessor,
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

  checkout: (
    productId: string,
    reservationId: string
  ) => Promise<CheckoutResult>;

  release: (
    productId: string,
    reservationId: string
  ) => boolean;

  expire: (
    productId: string,
    reservationId: string
  ) => boolean;

  dispose: () => void;
}

export function createInventoryStore(
  products: Product[],
  reservationDurationMs = 30_000,
  paymentProcessor: PaymentProcessor = async () => true
): InventoryStore {
  if (
    !Number.isFinite(reservationDurationMs) ||
    reservationDurationMs <= 0
  ) {
    throw new Error("Invalid reservation duration");
  }

  const states = new Map<string, InventorySnapshot>();
  const listeners = new Map<string, Set<Listener>>();

  const timeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

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

  function getSnapshot(
    productId: string
  ): InventorySnapshot {
    const state = states.get(productId);

    if (!state) {
      throw new Error(`Unknown product: ${productId}`);
    }

    return state;
  }

  function publish(
    productId: string,
    state: InventorySnapshot
  ): void {
    if (disposed) return;

    states.set(productId, state);

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
      (
        state.status !== "reserved" &&
        state.status !== "checking_out"
      ) ||
      state.reservationId !== reservationId ||
      state.expiresAt === null ||
      Date.now() < state.expiresAt
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
      (
        state.status === "reserved" ||
        state.status === "checking_out"
      ) &&
      state.expiresAt !== null &&
      state.reservationId !== null &&
      Date.now() >= state.expiresAt
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
      publish(
        productId,
        transitionInventory(current, {
          type: "RESERVE_REQUEST",
        })
      );
    } catch {
      return false;
    }

    // Simulated asynchronous reservation response.
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

    publish(
      productId,
      transitionInventory(pending, {
        type: "RESERVE_SUCCESS",
        reservationId,
        expiresAt,
      })
    );

    const timeout = setTimeout(() => {
      expire(productId, reservationId);
    }, reservationDurationMs);

    timeouts.set(productId, timeout);

    return true;
  }

  async function checkout(
    productId: string,
    reservationId: string
  ): Promise<CheckoutResult> {
    if (disposed) {
      return { ok: false, reason: "STORE_DISPOSED" };
    }

    expireIfNeeded(productId);

    const current = getSnapshot(productId);

    if (current.status === "checking_out") {
      return {
        ok: false,
        reason: "ALREADY_PROCESSING",
      };
    }

    if (current.status === "expired") {
      return { ok: false, reason: "EXPIRED" };
    }

    if (
      current.status !== "reserved" ||
      current.reservationId !== reservationId ||
      current.expiresAt === null
    ) {
      return {
        ok: false,
        reason: "INVALID_RESERVATION",
      };
    }

    publish(
      productId,
      transitionInventory(current, {
        type: "CHECKOUT_REQUEST",
      })
    );

    let paymentSucceeded = false;

    try {
      paymentSucceeded =
        await paymentProcessor(reservationId);
    } catch {
      paymentSucceeded = false;
    }

    if (disposed) {
      return { ok: false, reason: "STORE_DISPOSED" };
    }

    expireIfNeeded(productId);

    const latest = getSnapshot(productId);

    if (latest.status === "expired") {
      return { ok: false, reason: "EXPIRED" };
    }

    if (
      latest.status !== "checking_out" ||
      latest.reservationId !== reservationId
    ) {
      return {
        ok: false,
        reason: "INVALID_RESERVATION",
      };
    }

    if (!paymentSucceeded) {
      publish(
        productId,
        transitionInventory(latest, {
          type: "CHECKOUT_FAILURE",
        })
      );

      return {
        ok: false,
        reason: "PAYMENT_FAILED",
      };
    }

    clearExpiry(productId);

    publish(
      productId,
      transitionInventory(latest, {
        type: "CHECKOUT_SUCCESS",
      })
    );

    return { ok: true };
  }

  function release(
    productId: string,
    reservationId: string
  ): boolean {
    if (disposed) return false;

    expireIfNeeded(productId);

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
