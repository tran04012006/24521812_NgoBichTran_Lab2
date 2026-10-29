
import {
  useEffect,
  useState,
} from "react";

import type { Product } from "../types/product";

import type {
  CheckoutFailureReason,
} from "../types/inventory";

import { useInventory } from "../hooks/useInventory";
import { formatCountdown } from "../utils/time";

import "./InventoryControls.css";

interface ProductCardProps {
  product: Product;
}

function getCheckoutError(
  reason: CheckoutFailureReason
): string {
  switch (reason) {
    case "INVALID_RESERVATION":
      return "Invalid reservation. Please reserve again.";

    case "EXPIRED":
      return "Reservation expired before checkout finished.";

    case "ALREADY_PROCESSING":
      return "Checkout is already processing.";

    case "PAYMENT_FAILED":
      return "Payment failed. You may retry before expiry.";

    case "STORE_DISPOSED":
      return "Checkout is no longer available.";
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const {
    inventory,
    reserve,
    checkout,
    release,
  } = useInventory(product.id);

  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "info">("info");

  useEffect(() => {
    if (
      (
        inventory.status !== "reserved" &&
        inventory.status !== "checking_out"
      ) ||
      inventory.expiresAt === null
    ) {
      return;
    }

    const updateTime = () => setNow(Date.now());

    updateTime();

    const interval = setInterval(updateTime, 100);

    return () => clearInterval(interval);
  }, [inventory.status, inventory.expiresAt]);

  const totalStock =
    inventory.availableStock +
    inventory.sold +
    (
      inventory.status === "reserved" ||
      inventory.status === "checking_out"
        ? 1
        : 0
    );

  const soldPercentage =
    totalStock > 0
      ? (inventory.sold / totalStock) * 100
      : 0;

  const discountPercentage =
    product.originalPrice > 0
      ? Math.round(
          (1 - product.salePrice / product.originalPrice) *
            100
        )
      : 0;

  const remainingMs =
    inventory.expiresAt !== null &&
    (
      inventory.status === "reserved" ||
      inventory.status === "checking_out"
    )
      ? Math.max(0, inventory.expiresAt - now)
      : 0;

  const canReserve =
    inventory.availableStock > 0 &&
    (
      inventory.status === "available" ||
      inventory.status === "expired" ||
      inventory.status === "checked_out"
    );

  const isReserved = inventory.status === "reserved";
  const isCheckingOut =
    inventory.status === "checking_out";

  async function handleReserve(): Promise<void> {
    setMessage("");

    try {
      const success = await reserve();

      if (!success) {
        setMessage("Unable to reserve this product.");
        setMessageType("error");
        return;
      }

      setMessage("Product reserved for 30 seconds.");
      setMessageType("success");
    } catch {
      setMessage("An unexpected reservation error occurred.");
      setMessageType("error");
    }
  }

  async function handleCheckout(): Promise<void> {
    const reservationId = inventory.reservationId;

    if (!reservationId) {
      setMessage("No valid reservation.");
      setMessageType("error");
      return;
    }

    setMessage("Processing checkout...");
    setMessageType("info");

    try {
      const result = await checkout(reservationId);

      if (result.ok) {
        setMessage("Checkout completed successfully!");
        setMessageType("success");
      } else {
        setMessage(getCheckoutError(result.reason));
        setMessageType("error");
      }
    } catch {
      setMessage("An unexpected checkout error occurred.");
      setMessageType("error");
    }
  }

  function handleRelease(): void {
    const reservationId = inventory.reservationId;

    if (!reservationId) return;

    const success = release(reservationId);

    if (success) {
      setMessage("Reservation released.");
      setMessageType("info");
    } else {
      setMessage("Reservation could not be released.");
      setMessageType("error");
    }
  }

  return (
    <article className="product-card">
      <div className="product-image" aria-hidden="true">
        <span className="product-icon">
          {product.icon}
        </span>

        <span className="discount-badge">
          -{discountPercentage}%
        </span>
      </div>

      <div className="product-content">
        <h2>{product.name}</h2>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-prices">
          <span className="sale-price">
            {formatPrice(product.salePrice)}
          </span>

          <span className="original-price">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        <div className="stock-information">
          <div className="stock-labels">
            <span>Sold: {inventory.sold}</span>

            <span>
              Remaining: {inventory.availableStock}
            </span>
          </div>

          <div
            className="stock-progress"
            role="progressbar"
            aria-label={`${product.name} sold percentage`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(soldPercentage)}
          >
            <div
              className="stock-progress-fill"
              style={{
                width: `${soldPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="inventory-status">
          <span className="inventory-status-label">
            Status:
          </span>

          <span
            className={`inventory-badge status-${inventory.status}`}
          >
            {inventory.status.replace("_", " ")}
          </span>
        </div>

        {(isReserved || isCheckingOut) && (
          <div className="reservation-info">
            <span>Reservation expires in</span>

            <strong role="timer">
              {formatCountdown(remainingMs)}
            </strong>
          </div>
        )}

        {inventory.status === "expired" && (
          <p className="inventory-message">
            Reservation expired.
          </p>
        )}

        {isCheckingOut && (
          <div
            className="checkout-processing"
            role="status"
          >
            <span
              className="checkout-spinner"
              aria-hidden="true"
            />
            Processing checkout...
          </div>
        )}

        {message && (
          <p
            className={`checkout-feedback feedback-${messageType}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="inventory-actions">
          {isReserved ? (
            <>
              <button
                type="button"
                className="inventory-button checkout-button"
                onClick={() => {
                  void handleCheckout();
                }}
                disabled={remainingMs === 0}
              >
                Checkout
              </button>

              <button
                type="button"
                className="inventory-button release-button"
                onClick={handleRelease}
              >
                Release
              </button>
            </>
          ) : isCheckingOut ? (
            <button
              type="button"
              className="inventory-button checkout-button"
              disabled
            >
              Processing...
            </button>
          ) : (
            <button
              type="button"
              className="inventory-button reserve-button"
              disabled={!canReserve}
              onClick={() => {
                void handleReserve();
              }}
            >
              {inventory.status === "reserving"
                ? "Reserving..."
                : inventory.availableStock === 0
                  ? "Sold Out"
                  : "Reserve Now"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
