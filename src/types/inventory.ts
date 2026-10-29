
export type InventoryStatus =
  | "available"
  | "reserving"
  | "reserved"
  | "expired"
  | "checked_out";

export interface InventorySnapshot {
  readonly productId: string;
  readonly status: InventoryStatus;
  readonly availableStock: number;
  readonly sold: number;
  readonly reservationId: string | null;
  readonly expiresAt: number | null;
}

export type InventoryEvent =
  | { type: "RESERVE_REQUEST" }
  | {
      type: "RESERVE_SUCCESS";
      reservationId: string;
      expiresAt: number;
    }
  | { type: "RESERVE_FAILURE" }
  | { type: "RESERVATION_EXPIRED" }
  | { type: "RELEASE" }
  | { type: "CHECKOUT_SUCCESS" };
