import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global.css";

import "./styles/QueueTestPanel.css";
import "./styles/CancellationTestPanel.css";

import "./styles/QueueControls.css";
import "./styles/TrackQueueLive.css";
import "./styles/QueueResult.css";

import "./styles/AudioDecodeTestPanel.css";
import "./styles/AudioPlayback.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);