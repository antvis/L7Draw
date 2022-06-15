import { Scene } from '@antv/l7';
import EventEmitter from 'eventemitter3';
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
        this.emit(RenderEvent.dblClick, e);
      }
    }
    this.previousClick = { x, y, time };
  };

  onMouseMove = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.mousemove, e);
  };

  onMouseDown = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragstart, e);
  };

  onDragging = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragging, e);
  };

  onDragEnd = (e: ISceneMouseEvent) => {
    this.emit(RenderEvent.dragend, e);
  };

  enableDrag() {
    this.disableDrag();
    this.scene.on(SceneEvent.mousedown, this.onMouseDown);
    this.scene.on(SceneEvent.dragging, this.onDragging);
    this.scene.on(SceneEvent.mouseup, this.onDragEnd);
  }

  disableDrag() {
    this.scene.off(SceneEvent.mousedown, this.onMouseDown);
    this.scene.off(SceneEvent.dragging, this.onDragging);
    this.scene.off(SceneEvent.mouseup, this.onDragEnd);
  }

  enableMouseMove() {
    this.disableMouseMove();
    this.scene.on(SceneEvent.mousemove, this.onMouseMove);
  }

  disableMouseMove() {
    this.scene.off(SceneEvent.mousemove, this.onMouseMove);
  }

  enableDblClick() {
    this.scene.on(SceneEvent.mousedown, this.onDblClick);
  }

  disableDblClick() {
    this.scene.on(SceneEvent.mousedown, this.onDblClick);
  }
}
