// ReactDOM.createRoot(root).render(<App/>)

import {
  createContainer,
  updateContainer,
} from "react-reconciler/src/fiberReconciler";
import { ReactElementType } from "shared/ReactTypes";
import { Container } from "./hostConfig";

export function createRoot(container: Container) {
  const root = createContainer(container);
  console.log("render-root", root);

  return {
    render(element: ReactElementType) {
      console.log("render-element", element);
      updateContainer(element, root);
    },
  };
}
