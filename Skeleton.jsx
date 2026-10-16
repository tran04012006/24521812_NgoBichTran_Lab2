import React from "react";
import ReactDOM from "react-dom/client";
function Skeleton() {
  return (
    <div
      className="skeleton-container"
      role="status"
      aria-label="Loading article"
    >
      <div className="skeleton skeleton-title"></div>

      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line"></div>
      <div className="skeleton skeleton-line short"></div>

      <span className="sr-only">Loading article...</span>
    </div>
  );
}

export default Skeleton;
