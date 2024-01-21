import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [num, setnum] = useState(100);

  const arr =
    num % 2 === 0
      ? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
      : [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];

  return (
    <ul
      onClickCapture={() => {
        setnum(num + 1);
      }}
    >
      {arr}
    </ul>
  );
}

function Child() {
  return <div>big-react</div>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
