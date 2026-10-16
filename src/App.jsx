import { useState } from "react";
import { STATUS } from "../src/state-machine";
import React from "react";

function App() {
  const [state, setState] = useState({
    status: STATUS.IDLE,
  });

  const startLoading = () => {
    setState({ status: STATUS.LOADING });
  };

  const loadSuccess = () => {
    if (state.status !== STATUS.LOADING) return;

    setState({
      status: STATUS.SUCCESS,
      data: "Data loaded successfully!",
    });
  };

  const loadError = () => {
    if (state.status !== STATUS.LOADING) return;

    setState({
      status: STATUS.ERROR,
      error: "Failed to load data!",
    });
  };

  const reset = () => {
    setState({ status: STATUS.IDLE });
  };

  return (
    <main>
      <h1>Finite State Machine</h1>

      <p>Current State: {state.status}</p>

      {state.status === STATUS.SUCCESS && <p>{state.data}</p>}

      {state.status === STATUS.ERROR && <p>{state.error}</p>}

      <button onClick={startLoading}>Start Loading</button>

      <button onClick={loadSuccess}>Success</button>

      <button onClick={loadError}>Error</button>

      <button onClick={reset}>Reset</button>
    </main>
  );
}

export default App;
