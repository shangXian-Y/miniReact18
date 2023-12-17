import { ReactElementType } from "shared/ReactTypes";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { FiberNode, createFiberFromElement } from "./fiber";
import { HostText } from "./workTags";
import { Placement } from "./fiberFlags";

function ChildReconciler(shouldTrackEffects: boolean) {
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    // 根据element创建fiber
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: String | number
  ) {
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }

  // 根据shouldTrackEffects判断是否插入副作用
  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffects && fiber.alternate === null) {
      fiber.flags |= Placement;
    }
    return fiber;
  }

  return function reconcileChildrenFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType | null
  ) {
    // 判断当前fiber的类型
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFiber, newChild)
          );
        default:
          if (__DEV__) {
            console.warn("未实现的reconcile类型", newChild);
          }
          break;
      }
    }
    // 多节点 ul> li*3

    // HostText
    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFiber, newChild)
      );
    }
    console.log(123);
    if (__DEV__) {
      console.warn("未实现的reconcile类型-2", newChild);
    }
    return null;
  };
}

export const reconcileChildrenFibers = ChildReconciler(true);
export const mountChildrenFibers = ChildReconciler(false);
