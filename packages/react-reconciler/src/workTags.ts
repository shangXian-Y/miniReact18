export type workTag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText
  | typeof Fragment;

export const FunctionComponent = 0;
// createElement.render
export const HostRoot = 3;
// <div>
export const HostComponent = 5;
// <div>123</div> 中的 123
export const HostText = 6;
export const Fragment = 7;
