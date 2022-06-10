import EventEmitter from 'eventemitter3';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_STYLE,
  DrawerEvent,
  RENDER_MAP,
} from '../constant';
import { Scene } from '@antv/l7';
import { Source } from '../source';
import {
  DeepPartial,
  IBaseModeOptions,
  ICursorType,
  IRenderType,
  RenderMap,
} from '../typings';
import { cloneDeep, debounce, merge } from 'lodash';
import { Feature } from '@turf/turf';
import { Cursor } from '../interactive/cursor';
import Mousetrap from 'mousetrap';

export abstract class BaseMode<
  O extends IBaseModeOptions,
> extends EventEmitter<DrawerEvent> {
  /**
   * L7 场景实例，在构造器中传入
   */
  protected scene: Scene;

  /**
   * 数据管理中心
   */
  protected source: Source;

  /**
   * 渲染器render对象
   */
  protected render: RenderMap;

  /**
   * 指针管理器
   * @protected
   */
  protected cursor: Cursor;

  /**
   * Drawer 配置
   */
  protected options: O;

  /**
   * 当前Drawer是否为开启绘制状态
   */
  protected isEnable = false;

  constructor(scene: Scene, options: DeepPartial<O>) {
    super();
    this.bindThis();

    this.scene = scene;
    this.options = merge({}, this.getDefaultOptions(options), options);
    this.render = this.initRender();

    this.source = new Source({
      render: this.render,
    });
    this.cursor = new Cursor(scene, this.options.cursor);

    this.emit(DrawerEvent.init, this);
    this.bindCommonEvent();

    const initData = this.options.initData;
    if (initData) {
      setTimeout(() => {
        this.setData(initData);
        this.saveSourceHistory();
      }, 0);
    }
  }

  /**
   * 获取当前Drawer需要用到的render类型数据，避免创建无效的Render
   */
  abstract getRenderTypes(): IRenderType[];

  /**
   * 获取当前Drawer默认参数
   * @param options
   */
  abstract getDefaultOptions(options: DeepPartial<O>): O;

  /**
   * 监听事件
   */
  abstract bindEnableEvent(): void;

  /**
   * 解除监听事件
   */
  abstract unbindEnableEvent(): void;

  /**
   * 获取数据
   */
  abstract getData(): void;

  /**
   * 设置数据
   * @param data
   */
  abstract setData(data: Feature[]): void;

  /**
   * 获取当前是否为编辑态
   */
  getIsEnable() {
    return this.isEnable;
  }

  /**
   * 绑定回调函数的this指向
   */
  bindThis() {
    this.initRender = this.initRender.bind(this);
    this.getData = this.getData.bind(this);
    this.setData = this.setData.bind(this);
    this.bindCommonEvent = this.bindCommonEvent.bind(this);
  }

  /**
   * 监听通用事件
   */
  bindCommonEvent() {
    this.on(DrawerEvent.add, () => this.emitChangeEvent());
    this.on(DrawerEvent.edit, () => this.emitChangeEvent());
    this.on(DrawerEvent.addNode, () => this.saveSourceHistory());
    Mousetrap.bind(['command+z', 'ctrl+z'], () => {
      this.source.resetHistory();
    });
  }

  /**
   * 触发change事件
   */
  emitChangeEvent() {
    this.emit(DrawerEvent.change, this.getData());
    this.saveSourceHistory();
  }

  /**
   * 保存当前数据备份
   */
  saveSourceHistory = debounce(() => {
    this.source.saveHistory();
  }, 100);

  /**
   * 根据子类实现的 getRenderTypes 方法，初始化对应的Render实例。
   */
  initRender(): RenderMap {
    const renderMap: RenderMap = {};
    const renderTypeList = this.getRenderTypes();

    for (const renderType of renderTypeList) {
      const Render = RENDER_MAP[renderType];
      const style = this.options.style[renderType];
      renderMap[renderType] = new Render(this.scene, {
        // @ts-ignore
        style,
      });
    }

    return renderMap;
  }

  getCommonOptions<F extends Feature = Feature>(options: DeepPartial<O>): O {
    return {
      initData: [] as F[],
      autoFocus: true,
      cursor: cloneDeep(DEFAULT_CURSOR_MAP),
      editable: true,
      style: cloneDeep(DEFAULT_STYLE),
      multiple: true,
    } as unknown as O;
  }

  /**
   * 设置地图上光标样式类型
   * @param cursor
   */
  setCursor(cursor: ICursorType | null) {
    this.cursor.setCursor(cursor);
  }

  resetCursor() {
    this.setCursor('draw');
  }

  /**
   * 启用Drawer
   */
  enable() {
    if (this.isEnable) {
      return;
    }
    this.isEnable = true;
    this.setCursor('draw');
    this.unbindEnableEvent();
    this.bindEnableEvent();
    this.scene.setMapStatus({
      doubleClickZoom: false,
    });
    this.emit(DrawerEvent.enable, this);
  }

  /**
   * 禁用Drawer
   */
  disable() {
    if (!this.isEnable) {
      return;
    }
    this.isEnable = false;
    this.setCursor(null);
    this.unbindEnableEvent();
    this.scene.setMapStatus({
      doubleClickZoom: true,
    });
    this.emit(DrawerEvent.disable, this);
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
   * 销毁当前Drawer
   */
  destroy() {
    this.clear(true);
    Object.values(this.render).forEach((render) => {
      render.destroy();
    });
    this.emit(DrawerEvent.destroy, this);
  }
}
