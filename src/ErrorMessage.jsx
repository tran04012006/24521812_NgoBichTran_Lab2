import React from "react";
import ReactDOM from "react-dom/client";
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <h2>Connection Failed</h2>

      <p>{message}</p>

      <button type="button" onClick={onRetry}>
        Retry Connection
      </button>
    </div>
  );
}
