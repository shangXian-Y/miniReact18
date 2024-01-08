import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [num, setnum] = useState(100);
  window.setnum = setnum;

  return (
    <div
      onClickCapture={() => {
        setnum(num + 1);
      }}
    >
      {num}
    </div>
  );
}

function Child() {
  return <div>big-react</div>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
