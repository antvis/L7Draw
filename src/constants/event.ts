export enum DrawerEvent {
  init = 'init',
  destroy = 'destroy',
  enable = 'enable',
  disable = 'disable',
  add = 'add',
  dragStart = 'dragStart',
  dragging = 'dragging',
  dragEnd = 'dragEnd',
  change = 'change',
  click = 'click',
}

export enum SourceEvent {
  change = 'change',
}

export enum RenderEvent {
  unclick = 'unclick',
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseout = 'mouseout',
  dragging = 'dragging',
  dragend = 'dragend',
}
