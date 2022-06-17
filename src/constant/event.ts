/**
 * Drawer事件枚举
 */
export enum DrawerEvent {
  init = 'init',
  destroy = 'destroy',
  enable = 'enable',
  disable = 'disable',
  add = 'add',
  edit = 'edit',
  remove = 'remove',
  clear = 'clear',
  change = 'change',
  dragStart = 'dragStart',
  dragging = 'dragging',
  dragEnd = 'dragEnd',
  addNode = 'addNode',
}

/**
 * Source事件枚举
 */
export enum SourceEvent {
  change = 'change',
  update = 'update',
}

/**
 * Render事件枚举
 */
export enum RenderEvent {
  click = 'click',
  unclick = 'unclick',
  dragstart = 'dragstart',
  mousemove = 'mousemove',
  mouseout = 'mouseout',
  dragging = 'dragging',
  dragend = 'dragend',
  dblClick = 'dblClick',
}

/**
 * L7 Layer 事件名枚举
 */
export enum LayerEvent {
  mousedown = 'mousedown',
  mouseup = 'mouseup',
  click = 'click',
  unclick = 'unclick',
  dblclick = 'dblclick',
  mousemove = 'mousemove',
  mouseover = 'mouseover',
  mouseenter = 'mouseenter',
  mouseleave = 'mouseleave',
  mouseout = 'mouseout',
  contextmenu = 'contextmenu',
}

/**
 * L7 Scene 事件名枚举
 */
export enum SceneEvent {
  loaded = 'loaded',
  mapMove = 'mapmove',
  moveStart = 'movestart',
  moveEnd = 'moveend',
  zoomChange = 'zoomchange',
  zoomStart = 'zoomstart',
  zoomEnd = 'zoomend',
  click = 'click',
  dblclick = 'dblclick',
  mousemove = 'mousemove',
  mousewheel = 'mousewheel',
  mouseover = 'mouseover',
  mouseout = 'mouseout',
  mouseup = 'mouseup',
  mousedown = 'mousedown',
  contextmenu = 'contextmenu',
  dragstart = 'dragstart',
  dragging = 'dragging',
  dragend = 'dragend',
}
