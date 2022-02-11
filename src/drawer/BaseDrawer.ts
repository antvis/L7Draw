import EventEmitter from 'eventemitter3';
import {
  DeepPartial,
  IBaseFeature,
  ICursorType,
  IDrawerOptions,
  ISceneMouseEvent,
} from '../typings';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_DRAWER_STYLE,
  DrawerEvent,
  SourceEvent,
} from '../constants';
import { merge } from 'lodash';
import { Scene } from '@antv/l7';
import { Source } from '../source';
import nextTick from 'next-tick';

export abstract class BaseDrawer<
  T extends IDrawerOptions,
> extends EventEmitter<DrawerEvent> {
  scene: Scene;

  source: Source;

  options: T;

  // 当前是否开启编辑
  protected isEnable = false;

  constructor(scene: Scene, options?: DeepPartial<T>) {
    super();
    this.bindThis();

    this.scene = scene;
    this.options = merge({}, this.getDefaultOptions(), options ?? {});
    this.source = new Source(scene, {
      style: this.options.style,
      render: {
        point: true,
      },
    });
    this.bindSourceEvent();

    this.emit(DrawerEvent.init);
  }

  get container() {
    return (this.scene.getContainer()?.querySelector('.amap-maps') ??
      null) as HTMLDivElement | null;
  }

  abstract getDefaultOptions(): T;

  abstract onClick(e: ISceneMouseEvent): void;

  abstract getData(): IBaseFeature[];

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
    this.setCursor(null);
    this.emit(DrawerEvent.disable);
  }

  /**
   * 将当前所有的回调函数与this进行绑定
   */
  bindThis() {
    this.onClick = this.onClick.bind(this);
    this.getData = this.getData.bind(this);
  }

  /**
   * 绑定source相应事件
   */
  bindSourceEvent() {
    this.source.on(SourceEvent.change, () => {
      nextTick(() => this.emit(DrawerEvent.change, this.getData()));
    });
  }
}
