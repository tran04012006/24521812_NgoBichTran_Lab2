
import FlashSaleHeader from "./components/FlashSaleHeader";
import ProductCard from "./components/ProductCard";
import { products } from "./data/products";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <FlashSaleHeader />

      <main className="main-content">
        <section
          className="products-section"
          aria-labelledby="products-heading"
        >
          <div className="section-header">
            <div>
              <span className="section-label">
                LIMITED TIME OFFERS
              </span>

              <h2 id="products-heading">
                Flash Sale Products
              </h2>

              <p>
                Grab your favorite products before
                they are gone.
              </p>
            </div>

            <span className="product-count">
              {products.length} Products
            </span>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          High-Concurrency Flash-Sale Engine
          — Homework 3
        </p>
      </footer>
    </div>
  );
}
