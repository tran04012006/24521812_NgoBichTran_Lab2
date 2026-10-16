import React from "react";
import ReactDOM from "react-dom/client";
import Skeleton from "../Skeleton";
import ErrorMessage from "./ErrorMessage.jsx";
import "./error.css";
import { useState, useRef, useEffect } from "react";
import { fetchData } from "../fetchData";
import "../skeleton.css";
import { getErrorMessage } from "./errorUtils.js";

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
      if (currentId !== requestIdRef.current || controller.signal.aborted) {
        return;
      }

      setState({
        status: STATUS.ERROR,
        error: getErrorMessage(error),
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

      {state.status === STATUS.LOADING && <Skeleton />}
      {state.status === STATUS.SUCCESS && (
        <article className="article">
          <h2>{state.data.title}</h2>
          <p>{state.data.body}</p>
        </article>
      )}

      {state.status === STATUS.ERROR && (
        <ErrorMessage message={state.error} onRetry={loadData} />
      )}
    </main>
  );
}

export default App;

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
