import { Props, ReactElementType } from "shared/ReactTypes";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import {
  FiberNode,
  createFiberFromElement,
  createWorkInProgress,
} from "./fiber";
import { HostText } from "./workTags";
import { ChildDeletion, Placement } from "./fiberFlags";

// shouldTrackEffects 是否追踪副作用
function ChildReconciler(shouldTrackEffects: boolean) {
  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags = ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    work: if (currentFiber !== null) {
      // update
      if (currentFiber.key === element.key) {
        // key相同
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            // type相同
            const existing = useFiber(currentFiber, element.props);
            existing.return = returnFiber;
            return existing;
          }
          // 删除旧的
          deleteChild(returnFiber, currentFiber);
          break work;
        } else {
          if (__DEV__) {
            console.warn("还未实现的React类型-childFibers", element);
            break work;
          }
        }
      } else {
        // 删除旧的
        deleteChild(returnFiber, currentFiber);
      }
    }
    // 根据element创建fiber
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }
  // 复用Fiber
  function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: String | number
  ) {
    if (currentFiber !== null) {
      // update
      if (currentFiber.tag === HostText) {
        // 类型没变，可以复用
        const existing = useFiber(currentFiber, { content });
        existing.return = returnFiber;
        return existing;
      }
      deleteChild(returnFiber, currentFiber);
    }

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
    if (currentFiber !== null) {
      // 兜底删除
      deleteChild(returnFiber, currentFiber);
    }
    if (__DEV__) {
      console.warn("未实现的reconcile类型-2", newChild);
    }
    return null;
  };
}

export const reconcileChildrenFibers = ChildReconciler(true);
export const mountChildrenFibers = ChildReconciler(false);
