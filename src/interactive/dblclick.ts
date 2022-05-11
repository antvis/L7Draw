import { Scene } from '@antv/l7';
import { ISceneMouseEvent } from '../typings';
import EventEmitter from 'eventemitter3';
import { RenderEvent } from '../constants';

export class DblClickTrigger extends EventEmitter<RenderEvent> {
  scene: Scene;
  lastEvent: ISceneMouseEvent | null = null;
  lastClickTime = 0;

  constructor(scene: Scene) {
    super();
    this.scene = scene;
  }

  enable = () => {
    this.scene.on('mousedown', this.onMouseDown);
  };

  disable = () => {
    this.scene.on('mousedown', this.onMouseDown);
  };

  onMouseDown = (e: ISceneMouseEvent) => {
    const now = Date.now();
    if (
      Date.now() - this.lastClickTime < 300 &&
      e.pixel.x === this.lastEvent?.pixel.x &&
      e.pixel.y === this.lastEvent?.pixel.y
    ) {
      this.emit(RenderEvent.dblClick, e);
    }
    this.lastEvent = e;
    this.lastClickTime = now;
  };
}
