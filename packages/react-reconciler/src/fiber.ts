import { Props, Key, Ref } from "shared/ReactTypes";
import { workTag } from "./workTags";
import { Flags, NoFlags } from "./fiberFlags";

export class FiberNode {
  tag: workTag;
  pendingProps: Props;
  key: Key;
  stateNode: any;
  type: any;
  ref: Ref | null;

  return: FiberNode | null;
  sibling: FiberNode | null;
  children: FiberNode | null;
  index: number | null;

  memoizedProps: Props | null;
  alternate: FiberNode | null;
  flags: Flags;

  constructor(tag: workTag, pendingProps: Props, key: Key) {
    this.tag = tag;
    this.key = key;
    // HostComponent <div> div DOM
    this.stateNode = null;
    // FunctionComponent ()=>{}
    this.type = null;
    // 构成树状结构
    this.return = null;
    this.sibling = null;
    this.children = null;
    this.index = 0;

    this.ref = null;
    // 作为工作单元
    this.pendingProps = pendingProps;
    this.memoizedProps = null;

    this.alternate = null;
    // 副作用
    this.flags = NoFlags;
  }
}
