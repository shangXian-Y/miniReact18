const supportSymbol = typeof Symbol === "function" && Symbol.for;

export const REACT_ELEMENT_SYMBOL = supportSymbol
  ? Symbol.for("react.element")
  : 0xeca7;
