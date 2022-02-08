import EventEmitter from 'eventemitter3';
import {
  DeepPartial,
  ICursorType,
  IDrawerOptions,
  ISceneMouseEvent,
} from '../typings';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_DRAWER_STYLE,
  DrawerEvent,
} from '../constants';
import { merge } from 'lodash';
import { Scene } from '@antv/l7';

export abstract class BaseDrawer<
  T extends IDrawerOptions,
> extends EventEmitter<DrawerEvent> {
  scene: Scene;

  options: T;

  // 当前是否开启编辑
  protected isEnable = false;

  constructor(scene: Scene, options?: DeepPartial<T>) {
    super();

    this.scene = scene;
    this.options = merge({}, this.getDefaultOptions(), options ?? {});
    this.bindCallback();
    this.emit(DrawerEvent.init);
  }

  get container() {
    return (this.scene.getContainer()?.querySelector('.amap-maps') ??
      null) as HTMLDivElement | null;
  }

  abstract getDefaultOptions(): T;

  abstract onClick(e: ISceneMouseEvent): void;

  /**
   * 设置地图上光标样式类型
   * @param type
   */
  setCursor(type: ICursorType | null) {
    if (!this.container) {
      return;
    }
    if (type) {
      this.container.style.cursor = this.options.cursor[type];
    } else {
      this.container.style.cursor = '';
    }
  }

  /**
   * 获取默认通用options配置项
   */
  getCommonOptions(): IDrawerOptions {
    return {
      activeStyle: DEFAULT_DRAWER_STYLE,
      style: DEFAULT_DRAWER_STYLE,
      cursor: DEFAULT_CURSOR_MAP,
    };
  }

  /**
   * 启用编辑
   */
  enable() {
    this.isEnable = true;
    this.scene.on('click', this.onClick);
    this.setCursor('draw');
    this.emit(DrawerEvent.enable);
  }

  /**
   * 禁用编辑
   */
  disable() {
    this.isEnable = false;
    this.scene.off('click', this.onClick);
    this.emit(DrawerEvent.disable);
  }

  /**
   * 将当前所有的回调函数与this进行绑定
   */
  bindCallback() {
    this.onClick = this.onClick.bind(this);
  }
}
