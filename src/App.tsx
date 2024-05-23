import { useEffect } from "react";
import { initialize, startStopGame } from "./game";
import "./App.css";

function App() {
  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <div
        id="control"
        onClick={startStopGame}
        style={{ position: "absolute", margin: 25 }}
        className="button"
      ></div>
    </>
  );
}

export default App;
