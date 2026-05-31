import "./App.css";
import {useState} from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [countToSet, setCountToSet] = useState(0);

  const increamentHandler = () => {
 setCount(count+1 )
  }
  return (
    <div>
      <h1>Counter App</h1>
      <div className="card">count is {count}</div>
      <button onClick={increamentHandler} style={{ margin: "0 5px" }}>
        Increase
      </button>
      <button onClick={() => {setCount((count) => Math.max(count - 1,0))}} style={{ margin: "0 5px" }}>
        Decrease
      </button>
      <button onClick={() => {setCount((count) => 0)}} style={{ margin: "0 5px" }}>
        Reset
      </button>
      <div style={{ marginTop: "20px" }}>
        <input
          // type="number"
          value={countToSet}
          onChange={(e) => setCountToSet(Number(e.target.value))}
          placeholder="Enter a number"
          style={{
            width: "100px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.6em 1.2em",
            margin: "10 0px",
          }}
        />
      </div>
      <button style={{ marginTop: "20px" }} 
      onClick={() => setCount(countToSet)}>
        set to {countToSet}
      </button>
    </div>
  );
}
