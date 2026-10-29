
import {
  useCallback,
  useSyncExternalStore,
} from "react";

import { products } from "../data/products";

import {
  createInventoryStore,
} from "../services/inventoryStore";

const inventoryStore = createInventoryStore(
  products,
  30_000,
  async () => {
    // Simulated successful payment.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1200);
    });

    return true;
  }
);

export function useInventory(productId: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      return inventoryStore.subscribe(
        productId,
        listener
      );
    },
    [productId]
  );

  const getSnapshot = useCallback(
    () => inventoryStore.getSnapshot(productId),
    [productId]
  );

  const inventory = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  const reserve = useCallback(
    () => inventoryStore.reserve(productId),
    [productId]
  );

  const checkout = useCallback(
    (reservationId: string) =>
      inventoryStore.checkout(
        productId,
        reservationId
      ),
    [productId]
  );

  const release = useCallback(
    (reservationId: string) =>
      inventoryStore.release(
        productId,
        reservationId
      ),
    [productId]
  );

  return {
    inventory,
    reserve,
    checkout,
    release,
  };
}
