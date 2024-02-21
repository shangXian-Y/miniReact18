let syncQueue: ((...args: any) => void)[] | null = null;
// 执行状态
let isFlushingSyncQueue: boolean = false;

export function scheduleSyncCallback(callback: (...args: any) => void) {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

// 遍历执行
export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true;
    try {
      syncQueue.forEach((callback) => callback());
    } catch (e) {
      if (__DEV__) {
        console.error("flushSyncCallbacks报错", e);
      }
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}
