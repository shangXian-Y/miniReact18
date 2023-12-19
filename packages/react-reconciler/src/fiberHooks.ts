import { FiberNode } from "./fiber";
import internals from "shared/internals";

const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHooks: Hook | null = null;

interface Hook {
  memoizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}
export function renderWithHooks(wips: FiberNode) {
  // 赋值操作
  currentlyRenderingFiber = wips;
  const current = wips.alternate;
  if (current !== null) {
    // update阶段
  } else {
    // mount阶段
    currentDispatcher.current = 
  }

  const Component = wips.type;
  const props = wips.pendingProps;
  const children = Component(props);

  // 重置操作
  currentlyRenderingFiber = null;

  return children;
}
