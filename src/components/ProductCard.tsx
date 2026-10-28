
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const totalStock = product.stock + product.sold;

  const soldPercentage =
    totalStock > 0
      ? (product.sold / totalStock) * 100
      : 0;

  const discountPercentage =
    product.originalPrice > 0
      ? Math.round(
          (1 - product.salePrice / product.originalPrice) *
            100
        )
      : 0;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

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
            <span>Sold: {product.sold}</span>

            <span>
              Remaining: {product.stock}
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

        <button
          type="button"
          className="buy-button"
          disabled
        >
          Buy Now — Coming Soon
        </button>
      </div>
    </article>
  );
}
