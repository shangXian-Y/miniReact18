import { FiberNode } from "./fiber";
import { completeWork } from "./completeWork";
import { beginWork } from "./beginWork";

let workInProgress: FiberNode | null = null;

function perpareFreshStack(fiber: FiberNode) {
  workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
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
