import { useState } from "react";

import AudioPlayer from "./components/AudioPlayer";
import TrackQueue from "./components/TrackQueue";
import AudioVisualizer from "./components/AudioVisualizer";
import ScenarioSelector from "./components/ScenarioSelector";

import {
  defaultScenarioId,
  demoScenarios,
} from "./data/mockScenarios";

import type {
  ScenarioId,
} from "./data/mockScenarios";

import "./styles/App.css";

function App() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>(defaultScenarioId);

  const scenario = demoScenarios.find(
    (item) => item.id === selectedScenarioId
  );

  if (!scenario) {
    throw new Error(
      "Selected demo scenario does not exist."
    );
  }

  const selectedTrack =
    scenario.snapshot.activeTask?.track ??
    scenario.tasks[0]?.track ??
    null;

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-badge">
          HOMEWORK 2
        </span>

        <h1>
          Concurrent FIFO Audio Visualizer
        </h1>

        <p>
          An audio player powered by FIFO queue management,
          Web Audio API, and real-time frequency analysis.
        </p>
      </header>

      <ScenarioSelector
        scenarios={demoScenarios}
        selectedId={selectedScenarioId}
        onSelect={setSelectedScenarioId}
      />

      <div className="dashboard">
        <AudioPlayer track={selectedTrack} />

        <TrackQueue
          tasks={scenario.tasks}
          snapshot={scenario.snapshot}
        />

        <AudioVisualizer />
      </div>
    </main>
  );
}

export default App;