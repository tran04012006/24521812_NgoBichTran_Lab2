
import { useEffect, useState } from "react";

import type { Product } from "../types/product";

import { useInventory } from "../hooks/useInventory";
import { formatCountdown } from "../utils/time";

import "./InventoryControls.css";

interface ProductCardProps {
  product: Product;
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

  useEffect(() => {
    if (
      inventory.status !== "reserved" ||
      inventory.expiresAt === null
    ) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [inventory.status, inventory.expiresAt]);

  const totalStock =
    inventory.availableStock + inventory.sold +
    (inventory.status === "reserved" ? 1 : 0);

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
    inventory.status === "reserved" &&
    inventory.expiresAt !== null
      ? Math.max(0, inventory.expiresAt - now)
      : 0;

  const canReserve =
    inventory.availableStock > 0 &&
    (
      inventory.status === "available" ||
      inventory.status === "expired" ||
      inventory.status === "checked_out"
    );

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }

  async function handleReserve(): Promise<void> {
    await reserve();
  }

  function handleCheckout(): void {
    checkout();
  }

  function handleRelease(): void {
    release();
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

        {inventory.status === "reserved" && (
          <div className="reservation-info">
            <span>Reservation expires in</span>

            <strong aria-label="Reservation time remaining">
              {formatCountdown(remainingMs)}
            </strong>
          </div>
        )}

        {inventory.status === "expired" && (
          <p className="inventory-message">
            Your reservation has expired.
          </p>
        )}

        {inventory.status === "checked_out" && (
          <p className="inventory-success">
            Checkout completed successfully!
          </p>
        )}

        <div className="inventory-actions">
          {inventory.status === "reserved" ? (
            <>
              <button
                type="button"
                className="inventory-button checkout-button"
                onClick={handleCheckout}
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
