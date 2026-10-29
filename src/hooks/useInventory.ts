
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
  30_000
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
    () => inventoryStore.checkout(productId),
    [productId]
  );

  const release = useCallback(
    () => inventoryStore.release(productId),
    [productId]
  );

  return {
    inventory,
    reserve,
    checkout,
    release,
  };
}
