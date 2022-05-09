export enum DrawerEvent {
  init = 'init',
  destroy = 'destroy',
  enable = 'enable',
  disable = 'disable',
  add = 'add',
  edit = 'edit',
  dragStart = 'dragStart',
  dragging = 'dragging',
  dragEnd = 'dragEnd',
  change = 'change',
}

export enum SourceEvent {
  change = 'change',
}

export enum RenderEvent {
  click = 'click',
  unClick = 'unclick',
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseout = 'mouseout',
  dragging = 'dragging',
  dragend = 'dragend',
}
