import EventEmitter from 'eventemitter3';
import { cloneDeep, merge } from 'lodash';
import { Scene } from '@antv/l7';
import { Source } from '../source';
import nextTick from 'next-tick';
import {
  DeepPartial,
  ICursorType,
  IDrawerOptions,
  IRenderType,
  IRenderMap,
  IBaseFeature,
} from '../typings';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_DRAWER_STYLE,
  DrawerEvent,
  RENDER_TYPE_MAP,
  SourceEvent,
} from '../constants';
import { Cursor } from '../utils';

export abstract class BaseDrawer<T extends IDrawerOptions> extends EventEmitter<
  DrawerEvent
> {
  scene: Scene;
  source: Source;
  render: IRenderMap;
  options: T;
  cursor: Cursor;
  isEnable = false; // 当前是否开启编辑
  constructor(scene: Scene, options?: DeepPartial<T>) {
    super();
    this.bindThis();
    this.scene = scene;
    this.options = merge({}, this.getDefaultOptions(), options ?? {});
    this.render = this.initRender();
    this.cursor = new Cursor(scene, this.options.cursor);
    this.source = new Source({
      render: this.render,
      data: this.options.data,
    });
    this.emit(DrawerEvent.init);
  }

  get container() {
    return (this.scene.getContainer()?.querySelector('.amap-maps') ??
      null) as HTMLDivElement | null;
  }

  abstract getRenderList(): IRenderType[];

  abstract getDefaultOptions(): T;

  abstract bindEvent(): void;

  abstract unbindEvent(): void;

  getTypeData = <F extends IBaseFeature>(renderType: IRenderType) => {
    return (this.source.data[renderType] as unknown) as F[];
  };

  setTypeData = <F extends IBaseFeature>(
    renderType: IRenderType,
    updater: F[] | ((features: F[]) => F[]),
    store = true,
  ) => {
    const data =
      typeof updater === 'function'
        ? updater(this.getTypeData(renderType))
        : updater;
    this.source.setData(
      {
        [renderType]: data,
      },
      store,
    );
  };

  /**
   * 设置地图上光标样式类型
   * @param cursor
   */
  setCursor(cursor: ICursorType | null) {
    this.cursor.setCursor(cursor);
  }

  /**
   * 获取默认通用options配置项
   */
  getCommonOptions(): IDrawerOptions {
    return cloneDeep({
      style: DEFAULT_DRAWER_STYLE,
      cursor: DEFAULT_CURSOR_MAP,
      editable: true,
      autoFocus: true,
    });
  }

  /**
   * 启用编辑
   */
  enable() {
    this.isEnable = true;
    this.setCursor('draw');
    this.bindEvent();
    this.emit(DrawerEvent.enable);
  }

  /**
   * 禁用编辑
   */
  disable() {
    this.isEnable = false;
    this.setCursor(null);
    this.unbindEvent();
    this.emit(DrawerEvent.disable);
  }

  /**
   * 清空所有数据
   */
  clear(disable = false) {
    this.source.clear();

    if (disable) {
      this.disable();
    }
  }

  /**
   * 将当前所有的回调函数与this进行绑定
   */
  bindThis() {
    this.initRender = this.initRender.bind(this);
  }

  /**
   * 根据renderList实例化各个type的render
   */
  initRender() {
    const render: IRenderMap = {};
    this.getRenderList()?.forEach(key => {
      const Render = RENDER_TYPE_MAP[key];
      const style = this.options.style[key];
      // @ts-ignore
      render[key] = new Render(this.scene, { style });
    });
    return render;
  }
}
