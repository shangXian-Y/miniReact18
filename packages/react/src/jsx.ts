import { REACT_ELEMENT_SYMBOL } from "shared/ReactSymbols";
import { Type, Key, Ref, Props, ReactElementType } from "shared/ReactTypes";
// ReactEelement

const ReactElement = function (
  type: Type,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType {
  const element = {
    $$typeof: REACT_ELEMENT_SYMBOL,
    type,
    key,
    ref,
    props,
    __make: "yangY",
  };

  return element;
};

export const jsx = (
  type: ReactElementType,
  config: any,
  ...maybeChildren: any
) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;

  for (const prop in config) {
    let val = config[prop];
    if (prop === "key") {
      if (val != undefined) {
        key = val + "";
      }
      continue;
    }
    if (prop === "ref") {
      if (val != undefined) {
        ref = val + "";
      }
      continue;
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val;
    }
    const maybeChildrenLength = maybeChildren.length;
    if (maybeChildrenLength) {
      if (maybeChildrenLength === 1) {
        props.children = maybeChildren[0];
      } else {
        props.children = maybeChildren;
      }
    }
  }
};

export const jsxDEV = jsx;
