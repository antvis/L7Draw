import { Scene } from '@antv/l7';
import EventEmitter from 'eventemitter3';
import { debounce } from 'lodash';
import { RenderEvent, SceneEvent } from '../constant';
import { ISceneMouseEvent } from '../typings';

type PreviousClick = {
  time: number;
  x: number;
  y: number;
};

export class SceneRender extends EventEmitter<RenderEvent> {
  protected scene: Scene;

  protected previousClick?: PreviousClick;

  constructor(scene: Scene) {
    super();
    this.scene = scene;
  }

  /**
   * L7原生dblclick经常误触发，故改用这种方式
   * @param e
   */
  onDblClick = (e: ISceneMouseEvent) => {
    const { x = 0, y = 0 } = e.pixel ?? {};
    const time = Date.now();

    if (this.previousClick) {
      const { x: oldX, y: oldY, time: oldTime } = this.previousClick;
      if (
        time - oldTime < 300 &&
        Math.abs(x - oldX) < 5 &&
        Math.abs(y - oldY) < 5
      ) {
        this.emit(RenderEvent.DblClick, e);
      }
    }
    this.previousClick = { x, y, time };
  };

  onMouseMove = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Mousemove, e);
  };

  onMouseDown = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragstart, e);
  };

  onDragging = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragging, e);
  };

  onDragEnd = debounce((e: ISceneMouseEvent) => {
    this.emit(RenderEvent.Dragend, e);
  }, 0);

  enableDrag() {
    this.disableDrag();
    this.scene.on(SceneEvent.Mousedown, this.onMouseDown);
    this.scene.on(SceneEvent.Dragging, this.onDragging);
    this.scene.on(SceneEvent.Mouseup, this.onDragEnd);
    this.scene.on(SceneEvent.Dragend, this.onDragEnd);
  }

  disableDrag() {
    this.scene.off(SceneEvent.Mousedown, this.onMouseDown);
    this.scene.off(SceneEvent.Dragging, this.onDragging);
    this.scene.off(SceneEvent.Mouseup, this.onDragEnd);
    this.scene.off(SceneEvent.Dragend, this.onDragEnd);
  }

  enableMouseMove() {
    this.disableMouseMove();
    this.scene.on(SceneEvent.Mousemove, this.onMouseMove);
  }

  disableMouseMove() {
    this.scene.off(SceneEvent.Mousemove, this.onMouseMove);
  }

  enableDblClick() {
    this.disableDblClick();
    this.scene.on(SceneEvent.Mousedown, this.onDblClick);
  }

  disableDblClick() {
    this.scene.on(SceneEvent.Mousedown, this.onDblClick);
  }
}
