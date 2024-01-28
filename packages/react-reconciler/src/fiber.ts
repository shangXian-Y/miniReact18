import { Props, Key, Ref, ReactElementType } from "shared/ReactTypes";
import {
  Fragment,
  FunctionComponent,
  HostComponent,
  workTag,
} from "./workTags";
import { Flags, NoFlags } from "./fiberFlags";
import { Container } from "hostConfig";

export class FiberNode {
  // 状态标签*
  tag: workTag;
  pendingProps: Props;
  key: Key;
  stateNode: any;
  type: any;
  ref: Ref | null;
  // 父节点
  return: FiberNode | null;
  // 兄弟节点
  sibling: FiberNode | null;
  // 子节点
  child: FiberNode | null;
  // 索引
  index: number | null;

  memoizedProps: Props | null;
  memoizedState: any;
  // 双缓存树
  alternate: FiberNode | null;
  // 本元素动作标签*
  flags: Flags;
  // 子元素动作标签*
  subtreeFlags: Flags;
  // 更新状态*
  updateQueue: unknown;
  // 需要删除的节点
  deletions: FiberNode[] | null;

  constructor(tag: workTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key || null;
    // HostComponent <div> div DOM
    this.stateNode = null;
    // FunctionComponent ()=>{}
    this.type = null;
    // 构成树状结构
    this.return = null;
    this.sibling = null;
    this.child = null;
    this.index = 0;

    this.ref = null;
    // 作为工作单元
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;

    this.alternate = null;
    // 副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.deletions = null;
  }
}

export class FiberRootNode {
  // 容器
  container: Container;
  // current指针
  current: FiberNode;
  // 更新完成后的hostRootFiber
  finishedWork: FiberNode | null;
  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }
}
// 创建工作流
export const createWorkInProgress = (
  current: FiberNode,
  pendingProps: Props
): FiberNode => {
  let wip = current.alternate;
  if (wip === null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.stateNode = current.stateNode;

    wip.alternate = current;
    current.alternate = wip;
  } else {
    // update
    wip.pendingProps = pendingProps;
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
    wip.deletions = null;
  }
  wip.type = current.type;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;

  return wip;
};
// 根据element创建fiber
export function createFiberFromElement(element: ReactElementType): FiberNode {
  const { type, key, props } = element;
  let fiberTag: workTag = FunctionComponent;
  if (typeof type === "string") {
    fiberTag = HostComponent;
  } else if (typeof type !== "function" && __DEV__) {
    console.warn("未定义的type类型", element);
  }
  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;
  return fiber;
}
// 根据Fragment创建fiber
export function createFiberFromFragment(elements: any[], key: Key): FiberNode {
  const fiber = new FiberNode(Fragment, elements, key);
  return fiber;
}
