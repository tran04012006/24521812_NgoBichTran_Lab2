
import type {
  InventoryEvent,
  InventorySnapshot,
} from "../types/inventory";

export function transitionInventory(
  state: InventorySnapshot,
  event: InventoryEvent
): InventorySnapshot {
  switch (event.type) {
    case "RESERVE_REQUEST": {
      const canReserve =
        state.status === "available" ||
        state.status === "expired" ||
        state.status === "checked_out";

      if (!canReserve || state.availableStock <= 0) {
        throw new Error("Product is not available");
      }

      return {
        ...state,
        status: "reserving",
        reservationId: null,
        expiresAt: null,
      };
    }

    case "RESERVE_SUCCESS": {
      if (state.status !== "reserving") {
        throw new Error("Invalid reserve confirmation");
      }

      if (state.availableStock <= 0) {
        throw new Error("Insufficient stock");
      }

      return {
        ...state,
        status: "reserved",
        availableStock: state.availableStock - 1,
        reservationId: event.reservationId,
        expiresAt: event.expiresAt,
      };
    }

    case "RESERVE_FAILURE": {
      if (state.status !== "reserving") {
        throw new Error("Invalid reserve failure");
      }

      return {
        ...state,
        status: "available",
      };
    }

    case "CHECKOUT_REQUEST": {
      if (state.status !== "reserved") {
        throw new Error("Checkout requires reservation");
      }

      return {
        ...state,
        status: "checking_out",
      };
    }

    case "CHECKOUT_FAILURE": {
      if (state.status !== "checking_out") {
        throw new Error("No checkout is processing");
      }

      return {
        ...state,
        status: "reserved",
      };
    }

    case "CHECKOUT_SUCCESS": {
      if (state.status !== "checking_out") {
        throw new Error("Invalid checkout confirmation");
      }

      return {
        ...state,
        status: "checked_out",
        sold: state.sold + 1,
        reservationId: null,
        expiresAt: null,
      };
    }

    case "RESERVATION_EXPIRED": {
      if (
        state.status !== "reserved" &&
        state.status !== "checking_out"
      ) {
        throw new Error("No active reservation");
      }

      return {
        ...state,
        status: "expired",
        availableStock: state.availableStock + 1,
        reservationId: null,
        expiresAt: null,
      };
    }

    case "RELEASE": {
      if (state.status !== "reserved") {
        throw new Error("Cannot release reservation");
      }

      return {
        ...state,
        status: "available",
        availableStock: state.availableStock + 1,
        reservationId: null,
        expiresAt: null,
      };
    }
  }
}
