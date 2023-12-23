import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [num] = useState(100);
  return (
    <div>
      {/* <span>MiniReact!</span> */}
      {num}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
