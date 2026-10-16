import React from "react";
import ReactDOM from "react-dom/client";

const { useState, useRef, useEffect } = React;

const STATUS = Object.freeze({
  IDLE: "IDLE",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
});

function App() {
  const [state, setState] = useState({
    status: STATUS.IDLE,
  });

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadData = async () => {
    // Vô hiệu hóa request cũ
    requestIdRef.current += 1;
    const currentId = requestIdRef.current;

    // Hủy request trước nếu còn chạy
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: STATUS.LOADING });

    try {
      const data = await fetchData(controller.signal);

      // Chỉ request mới nhất được cập nhật state
      if (currentId !== requestIdRef.current || controller.signal.aborted) {
        return;
      }

      setState({
        status: STATUS.SUCCESS,
        data: data,
      });
    } catch (error) {
      // Bỏ qua lỗi do hủy request
      if (currentId !== requestIdRef.current || controller.signal.aborted) {
        return;
      }

      setState({
        status: STATUS.ERROR,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      if (currentId === requestIdRef.current) {
        controllerRef.current = null;
      }
    }
  };

  // Hủy request khi component unmount
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    };
  }, []);

  return (
    <main>
      <h1>Safe Async Data Handling</h1>

      <p>Current State: {state.status}</p>

      <button onClick={loadData}>Load Data</button>

      {state.status === STATUS.LOADING && <p>Loading data...</p>}

      {state.status === STATUS.SUCCESS && (
        <div>
          <h2>Data loaded successfully!</h2>
          <pre>{JSON.stringify(state.data, null, 2)}</pre>
        </div>
      )}

      {state.status === STATUS.ERROR && (
        <p role="alert">Error: {state.error}</p>
      )}
    </main>
  );
}

export default App;

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
