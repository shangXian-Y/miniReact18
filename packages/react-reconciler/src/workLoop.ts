import { FiberNode, FiberRootNode, createWorkInProgress } from "./fiber";
import { completeWork } from "./completeWork";
import { beginWork } from "./beginWork";
import { HostRoot } from "./workTags";

let workInProgress: FiberNode | null = null;

function perpareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateFiber(fiber: FiberNode) {
  // TODO 调度功能
  const root = markUpdateFromFiberToRoot(fiber);
  renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

function renderRoot(root: FiberRootNode) {
  // 初始化
  perpareFreshStack(root);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      console.warn("workLoop内发生错误", e);
      workInProgress = null;
    }
  } while (true);
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  commitRoot(root);
}

function workLoop() {
  while (workInProgress != null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber);
  fiber.memoizedProps = fiber.pendingProps;
  // 没有子节点时，进入 归 状态，有则继续 递 状态
  if (next === null) {
    completeUnitOfWork(fiber);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber;
  do {
    completeWork(node);
    const sibling = node.sibling;
    if (sibling != null) {
      workInProgress = node.return;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node != null);
}
