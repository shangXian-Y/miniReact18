import { Dispatch, Dispatcher } from "react/src/currentDispatcher";
import { FiberNode } from "./fiber";
import internals from "shared/internals";
import {
  UpdateQueue,
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
} from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

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
    currentDispatcher.current = HooksDispatcherOnUpdate;
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

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
};

function updateState<State>(
  initialState: (() => State) | State
): [State, Dispatch<State>] {
  // 找到当前useState对应的Hook数据
  const hook = updateWorkInProgressHook();
  // 计算新state的逻辑
  const queue = hook.updateQueue as UpdateQueue<State>;
  const pending = queue.shared.pending;

  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
    hook.memoizedState = memoizedState;
  }

  return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function updateWorkInProgressHook(): Hook {
  // TODO: render阶段触发的更新
  let nextCurrentHook: Hook | null;
  if (currentHook === null) {
    // 这个是FC update时 第一个hook
    const current = currentlyRenderingFiber?.alternate;
    if (current !== null) {
      nextCurrentHook = current?.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    // 这个是FC update时 后续的hook
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    // mount/update  u1 u2 u3
    // update        u1 u2 u3 u4
    throw new Error(
      `组件${currentlyRenderingFiber?.type}本次执行时的Hook比上次执行的多`
    );
  }

  currentHook = nextCurrentHook as Hook;
  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,
    updateQueue: currentHook.updateQueue,
    next: null,
  };

  if (workInProgressHook === null) {
    // update 第一个hook
    if (currentlyRenderingFiber === null) {
      throw new Error("请在函数组件内调用Hook");
    } else {
      workInProgressHook = newHook;
      currentlyRenderingFiber.memoizedState = workInProgressHook;
    }
  } else {
    // update时后续的hooks
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }

  return workInProgressHook;
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
