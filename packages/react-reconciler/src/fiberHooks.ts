import { Dispatch, Dispatcher } from "react/src/currentDispatcher";
import { FiberNode } from "./fiber";
import internals from "shared/internals";
import {
  UpdateQueue,
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
} from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

interface Hook {
  memoizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}
export function renderWithHooks(wips: FiberNode) {
  // 赋值操作
  currentlyRenderingFiber = wips;
  // 重置
  wips.memoizedState = null;

  const current = wips.alternate;
  if (current !== null) {
    // update阶段
  } else {
    // mount阶段
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const Component = wips.type;
  const props = wips.pendingProps;
  const children = Component(props);

  // 重置操作
  currentlyRenderingFiber = null;

  return children;
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

function mountState<State>(
  initialState: (() => State) | State
): [State, Dispatch<State>] {
  const hook = mountWorkInProgressHook();
  let memoizedState;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }
  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;
  hook.memoizedState = memoizedState;

  // @ts-ignore
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  queue.dispatch = dispatch;

  return [memoizedState, dispatch];
}

function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  const update = createUpdate(action);
  enqueueUpdate(updateQueue, update);
  scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // mount 第一个hook
    if (currentlyRenderingFiber === null) {
      throw new Error("请在函数组件内调用Hook");
    } else {
      workInProgressHook = hook;
      currentlyRenderingFiber.memoizedState = workInProgressHook;
    }
  } else {
    // mount时后续的hooks
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }

  return workInProgressHook;
}
