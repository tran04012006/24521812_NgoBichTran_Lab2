
export default function FlashSaleHeader() {
  return (
    <header className="flash-sale-header">
      <div className="header-content">
        <span className="sale-badge">
          11.11 MEGA SALE
        </span>

        <h1>Vietnam Flash Sale</h1>

        <p>
          Discover amazing products at incredible prices.
        </p>

        <div className="countdown-section">
          <span className="countdown-label">
            Sale countdown (preview)
          </span>

          <div
            className="countdown-display"
            aria-label="Countdown preview: 15 minutes"
          >
            00:15:00
          </div>

          <p className="countdown-note">
            Live countdown will be implemented in Task 2.
          </p>
        </div>
      </div>
    </header>
  );
}
