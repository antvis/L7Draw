/**
 * Drawer事件枚举
 */
export enum DrawEvent {
  Init = 'init',
  Destroy = 'destroy',
  Enable = 'enable',
  Disable = 'disable',
  Add = 'add',
  Edit = 'edit',
  Remove = 'remove',
  Clear = 'clear',
  Change = 'change',
  DragStart = 'dragStart',
  Dragging = 'dragging',
  DragEnd = 'dragEnd',
  AddNode = 'addNode',
  RemoveNode = 'removeNode',
}

/**
 * Source事件枚举
 */
export enum SourceEvent {
  Change = 'change',
  Update = 'update',
}

/**
 * Render事件枚举
 */
export enum RenderEvent {
  Click = 'click',
  UnClick = 'unclick',
  Dragstart = 'dragstart',
  Mousemove = 'mousemove',
  Mouseout = 'mouseout',
  Dragging = 'dragging',
  Dragend = 'dragend',
  DblClick = 'dblClick',
  Contextmenu = 'contextmenu',
}

/**
 * L7 Layer 事件名枚举
 */
export enum LayerEvent {
  Mousedown = 'mousedown',
  Mouseup = 'mouseup',
  Click = 'click',
  UnClick = 'unclick',
  Dblclick = 'dblclick',
  Mousemove = 'mousemove',
  Mouseover = 'mouseover',
  Mouseenter = 'mouseenter',
  Mouseleave = 'mouseleave',
  Mouseout = 'mouseout',
  Contextmenu = 'contextmenu',
}

/**
 * L7 Scene 事件名枚举
 */
export enum SceneEvent {
  Loaded = 'loaded',
  MapMove = 'mapmove',
  MoveStart = 'movestart',
  MoveEnd = 'moveend',
  ZoomChange = 'zoomchange',
  ZoomStart = 'zoomstart',
  ZoomEnd = 'zoomend',
  Click = 'click',
  Dblclick = 'dblclick',
  Mousemove = 'mousemove',
  Mousewheel = 'mousewheel',
  Mouseover = 'mouseover',
  Mouseout = 'mouseout',
  Mouseup = 'mouseup',
  Mousedown = 'mousedown',
  Contextmenu = 'contextmenu',
  Dragstart = 'dragstart',
  Dragging = 'dragging',
  Dragend = 'dragend',
}

export enum ControlEvent {
  DrawChange = 'drawChange',
  DataChange = 'dataChange',
}
