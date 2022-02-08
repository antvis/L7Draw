import EventEmitter from 'eventemitter3';
import { DeepPartial, IDrawerOptions, ISceneMouseEvent } from '../typings';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_DRAWER_STYLE,
  DrawerEvent,
} from '../constants';
import { merge } from 'lodash';
import { Scene } from '@antv/l7';
import { IPointDrawerOptions } from './PointDrawer';

export abstract class BaseDrawer<
  T extends IDrawerOptions,
> extends EventEmitter<DrawerEvent> {
  // 当前是否开启编辑
  protected isEnable = false;

  scene: Scene;
  options: T;

  constructor(scene: Scene, options?: DeepPartial<T>) {
    super();

    this.scene = scene;
    this.options = merge({}, this.getDefaultOptions(), options ?? {});
    this.emit(DrawerEvent.init);
  }

  abstract getDefaultOptions(): T;

  getCommonOptions(): IDrawerOptions {
    return {
      activeStyle: DEFAULT_DRAWER_STYLE,
      style: DEFAULT_DRAWER_STYLE,
      cursor: DEFAULT_CURSOR_MAP,
    };
  }

  abstract onMouseDown(e: ISceneMouseEvent): void;

  enable() {
    this.isEnable = true;
    this.scene.on('mousedown', this.onMouseDown);
    this.emit(DrawerEvent.enable);
  }

  disable() {
    this.isEnable = false;
    this.scene.off('mousedown', this.onMouseDown);
    this.emit(DrawerEvent.disable);
  }
}
