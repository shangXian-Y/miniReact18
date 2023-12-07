import { Action } from "shared/ReactTypes";

export interface Update<State> {
  action: Action<State>;
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}
// 创建Update实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
  return {
    action,
  };
};
// 创建UpdateQueue实例
export const createUpdateQueue = <Action>() => {
  return {
    shared: {
      pending: null,
    },
  } as UpdateQueue<Action>;
};
// 将Update存入UpdateQueue
export const enqueueUpdate = <Action>(
  updateQueue: UpdateQueue<Action>,
  update: Update<Action>
) => {
  updateQueue.shared.pending = update;
};
// 消费UpdateQueue
export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;
    if (action instanceof Function) {
      // baseState 1 pendingUpdate (x) => 4x --> memoizedState 4
      result.memoizedState = action(baseState);
    } else {
      // baseState 1 pendingUpdate 2 --> memoizedState 2
      result.memoizedState = action;
    }
  }

  return result;
};
