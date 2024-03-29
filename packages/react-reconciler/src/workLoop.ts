import {
  FiberNode,
  FiberRootNode,
  PendingPassiveEffects,
  createWorkInProgress,
} from "./fiber";
import { completeWork } from "./completeWork";
import { beginWork } from "./beginWork";
import { HostRoot } from "./workTags";
import { MutationMask, NoFlags, PassiveMark } from "./fiberFlags";
import {
  commitHookEffectListCreate,
  commitHookEffectListDestory,
  commitHookEffectListUnmount,
  commitMutationEffects,
} from "./commitWork";
import {
  Lane,
  NoLane,
  SyncLane,
  getHighestPriorityLane,
  markRootFinished,
  mergeLanes,
} from "./fiberLanes";
import { flushSyncCallbacks, scheduleSyncCallback } from "./syncTaskQueue";
import { scheduleMicroTask } from "hostConfig";
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_NormalPriority as NormalPriority,
} from "scheduler";
import { HookHasEffect, Passive } from "./hookEffectTags";

let workInProgress: FiberNode | null = null;
let wipRootRenderLane: Lane = NoLane;
let rootDoesHasPassiveEffects: boolean = false;

function perpareFreshStack(root: FiberRootNode, lane: Lane) {
  workInProgress = createWorkInProgress(root.current, {});
  wipRootRenderLane = lane;
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
  // TODO 调度功能
  // root --> FiberRootNode
  const root = markUpdateFromFiberToRoot(fiber);
  markRootUpdate(root, lane);
  ensureRootIsScheduled(root);
}

// schedule阶段入口 调度阶段入口
function ensureRootIsScheduled(root: FiberRootNode) {
  const updateLane = getHighestPriorityLane(root.pendingLanes);
  if (updateLane === NoLane) {
    return;
  }
  if (updateLane === SyncLane) {
    // 同步优先级 用微任务调度
    if (__DEV__) {
      console.log("在微任务中更新，优先级：", updateLane);
    }
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane));
    scheduleMicroTask(flushSyncCallbacks);
  } else {
    // 其他优先级 用宏任务调度
  }
}

function markRootUpdate(root: FiberRootNode, lane: Lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane);
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

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
  const nextLane = getHighestPriorityLane(root.pendingLanes);

  if (nextLane !== SyncLane) {
    // 1.其他比SyncLane低的优先级
    // 2.NoLane
    // 初上上述2种情况下，重新进行一次调度
    ensureRootIsScheduled(root);
    return;
  }
  console.warn("render阶段开始");

  // 初始化
  perpareFreshStack(root, lane);

  do {
    try {
      workLoop();
      break;
    } catch (e) {
      if (__DEV__) {
        console.warn("workLoop内发生错误", e);
      }
      workInProgress = null;
    }
  } while (true);
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLane = lane;
  wipRootRenderLane = NoLane;
  // wip fiberNode树 树中的flags
  commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  console.warn("commit阶段开始", finishedWork);
  const lane = root.finishedLane;
  if (lane === NoLane && __DEV__) {
    console.error("commit阶段finishedLane不应该是NoLane");
  }

  // 重置
  root.finishedWork = null;
  root.finishedLane = NoLane;
  // 移除已经处理过的lane
  markRootFinished(root, lane);

  if (
    (finishedWork.flags & PassiveMark) !== NoFlags ||
    (finishedWork.subtreeFlags & PassiveMark) !== NoFlags
  ) {
    // 防止多次执行commitRoot时，多次进行调度
    if (!rootDoesHasPassiveEffects) {
      rootDoesHasPassiveEffects = true;
      // 调度副作用
      scheduleCallback(NormalPriority, () => {
        // 执行副作用
        flushPassiveEffects(root.pendingPassiveEffects);
        // TODO: 并发更新时讲解return
        return;
      });
    }
  }

  // 判断是否存在3个子阶段需要执行的操作
  // root flags 和 root subtreeFlags
  const subtreeHasEffent =
    (finishedWork.subtreeFlags & (MutationMask | PassiveMark)) !== NoFlags;
  const rootHasEffent =
    (finishedWork.flags & (MutationMask | PassiveMark)) !== NoFlags;

  if (subtreeHasEffent || rootHasEffent) {
    // beforeMutation
    // mutation Placement
    commitMutationEffects(finishedWork, root);
    // 切换fiber树 --> mutation阶段完成 和 layout阶段开始之间
    root.current = finishedWork;
    // layout
  } else {
    root.current = finishedWork;
  }

  rootDoesHasPassiveEffects = false;
  ensureRootIsScheduled(root);
}

function flushPassiveEffects(pendingPassiveEffects: PendingPassiveEffects) {
  pendingPassiveEffects.unmount.forEach((effect) => {
    commitHookEffectListUnmount(Passive, effect);
  });
  pendingPassiveEffects.unmount = [];

  pendingPassiveEffects.update.forEach((effect) => {
    commitHookEffectListDestory(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update.forEach((effect) => {
    commitHookEffectListCreate(Passive | HookHasEffect, effect);
  });
  pendingPassiveEffects.update = [];
  flushSyncCallbacks();
}

function workLoop() {
  while (workInProgress != null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber, wipRootRenderLane);
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
    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }
    node = node.return;
    workInProgress = node;
  } while (node != null);
}
