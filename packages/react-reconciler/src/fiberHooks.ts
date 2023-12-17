import { FiberNode } from "./fiber";

export function renderWithHooks(wips: FiberNode) {
  const Component = wips.type;
  const props = wips.pendingProps;
  const children = Component(props);

  return children;
}
