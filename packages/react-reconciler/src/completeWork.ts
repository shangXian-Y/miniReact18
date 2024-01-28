import {
  Container,
  createInstance,
  appendInitialChild,
  createTextInstance,
} from "hostConfig";
import { FiberNode } from "./fiber";
import {
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTags";
import { NoFlags, Update } from "./fiberFlags";
import { updateFiberProps } from "react-dom/src/SyntheticEvent";

// 标记更新
function markUpdate(wip: FiberNode) {
  wip.flags |= Update;
}

export const completeWork = (wip: FiberNode) => {
  // 递归中的 归 阶段
  const newProps = wip.pendingProps;
  const current = wip.alternate;

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // update
        // TODO: 1.props是否变化 onClick：xx onClick：XXX
        // TODO: 2.变了update flag
        updateFiberProps(wip.stateNode, newProps);
      } else {
        // mount  1.创建DOM
        const instance = createInstance(wip.type, newProps);
        // const instance = createInstance(wip.type);
        // 2.将DOM插入DOM树中
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        // update
        const oldText = current.memoizedProps.content;
        const newText = newProps.content;
        if (oldText !== newText) {
          markUpdate(wip);
        }
      } else {
        // mount  1.创建DOM
        const instance = createTextInstance(newProps.content);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
    case FunctionComponent:
    case Fragment:
      bubbleProperties(wip);
      return null;

    default:
      if (__DEV__) {
        console.warn("未处理的completeWork归阶段的情况", wip);
      }
      break;
  }
};

// 插入DOM树
function appendAllChildren(parent: Container, wip: FiberNode) {
  let node = wip.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node?.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === wip) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node?.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

// 冒泡存储flags
function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child.return = wip;
    child = child.sibling;
  }
  wip.subtreeFlags |= subtreeFlags;
}
