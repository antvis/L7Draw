import { Scene } from '@antv/l7';
import { Feature } from '@turf/turf';
import EventEmitter from 'eventemitter3';
import { cloneDeep, debounce, merge } from 'lodash';
import Mousetrap from 'mousetrap';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_HISTORY_CONFIG,
  DEFAULT_KEYBOARD_CONFIG,
  DEFAULT_STYLE,
  DrawEvent,
  RENDER_MAP,
  SceneEvent,
} from '../constant';
import { Cursor } from '../interactive';
import { SceneRender } from '../render';
import { Source } from '../source';
import {
  DeepPartial,
  IBaseFeature,
  IBaseModeOptions,
  ICursorType,
  ILngLat,
  IRenderType,
  ISceneMouseEvent,
  RenderMap,
} from '../typings';
import { getLngLat, isSameFeature } from '../utils';

export abstract class BaseMode<
  O extends IBaseModeOptions = IBaseModeOptions,
> extends EventEmitter<DrawEvent> {
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

  /**
   * scene相关事件管理
   * @protected
   */
  protected sceneRender: SceneRender;

  protected mouseLngLat: ILngLat = {
    lng: 0,
    lat: 0,
  };

  constructor(scene: Scene, options: DeepPartial<O>) {
    super();
    this.bindThis();

    this.scene = scene;
    this.sceneRender = new SceneRender(scene);
    this.options = merge({}, this.getDefaultOptions(options), options);
    this.render = this.initRender();

    this.source = new Source({
      render: this.render,
      history: this.options.history || undefined,
    });
    this.cursor = new Cursor(scene, this.options.cursor);

    const initData = this.options.initData;
    if (initData) {
      this.setData(initData);
    }
    this.saveHistory();

    this.bindCommonEvent();
    this.emit(DrawEvent.init, this);
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
   * 获取数据
   */
  abstract getData(): IBaseFeature[];

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
    this.emitChangeEvent = this.emitChangeEvent.bind(this);
    this.saveHistory = this.saveHistory.bind(this);
    this.onSceneMouseMove = this.onSceneMouseMove.bind(this);
    this.revertHistory = this.revertHistory.bind(this);
    this.redoHistory = this.redoHistory.bind(this);
    this.removeActiveItem = this.removeActiveItem.bind(this);
    this.bindCommonEvent = this.bindCommonEvent.bind(this);
  }

  bindCommonEvent() {
    this.on(DrawEvent.add, this.emitChangeEvent);
    this.on(DrawEvent.edit, this.emitChangeEvent);
    this.on(DrawEvent.remove, this.emitChangeEvent);
    this.on(DrawEvent.clear, this.emitChangeEvent);
    this.on(DrawEvent.addNode, this.saveHistory);
  }

  /**
   * 监听通用事件
   */
  bindEnableEvent() {
    this.scene.on(SceneEvent.mousemove, this.saveMouseLngLat);

    // 快捷键绑定
    const { revert, redo, remove } = this.options.keyboard || {};
    remove && Mousetrap.bind(remove, this.removeActiveItem);
    if (this.options.history) {
      revert && Mousetrap.bind(revert, this.revertHistory);
      redo && Mousetrap.bind(redo, this.redoHistory);
    }
  }

  /**
   * 监听通用事件
   */
  unbindEnableEvent() {
    this.scene.off(SceneEvent.mousemove, this.saveMouseLngLat);

    // 快捷键解绑
    const { revert, redo, remove } = this.options.keyboard || {};
    remove && Mousetrap.unbind(remove);
    if (this.options.history) {
      revert && Mousetrap.unbind(revert);
      redo && Mousetrap.unbind(redo);
    }
  }

  // 用于收集当前鼠标所在经纬度的回调函数，用于在数据回退时，若有存在绘制中的数据，伪造mousemove事件时使用
  saveMouseLngLat = debounce(
    (e: ISceneMouseEvent) => {
      this.mouseLngLat = getLngLat(e);
    },
    100,
    {
      maxWait: 100,
    },
  );

  /**
   * 触发change事件，同时触发保存数据备份
   */
  emitChangeEvent() {
    this.emit(DrawEvent.change, this.getData());
    this.saveHistory();
  }

  /**
   * 保存当前数据备份
   */
  saveHistory = debounce(() => {
    if (!this.options.history) {
      return;
    }
    this.source.saveHistory();
  }, 100);

  /**
   * 回退至上一次数据备份
   */
  revertHistory() {
    if (!this.isEnable || !this.options.history) {
      return;
    }
    if (this.source.revertHistory()) {
      this.correctDrawItem();
    }
  }

  /**
   * 重做回退之前的数据备份
   */
  redoHistory() {
    if (!this.isEnable || !this.options.history) {
      return;
    }
    if (this.source.redoHistory()) {
      this.correctDrawItem();
    }
  }

  /**
   * 删除当前active的绘制物
   */
  removeActiveItem() {
    const activeItem = this.getData().find((item) => {
      // @ts-ignore
      const { isActive, isDraw } = item.properties;
      return isActive || isDraw;
    });
    if (activeItem) {
      this.removeItem(activeItem);
    }
    return activeItem;
  }

  /**
   * 删除指定
   * @param target
   */
  removeItem<F extends IBaseFeature = IBaseFeature>(target: F) {
    const data = this.getData();
    // @ts-ignore
    this.setData(data.filter((item) => !isSameFeature(target, item)));
    this.emit(DrawEvent.remove, target, this.getData());
  }

  /**
   * 矫正正在绘制Feature的虚线部分（Drawer中都是在onSceneMouseMove中进行绘制）
   */
  correctDrawItem() {
    const drawItem = this.getData().find((item) => item.properties.isDraw);
    // 如果当前有正在绘制的元素，需要将虚线部分与鼠标位置表现一致，而非history保存时的虚线位置
    if (drawItem) {
      this.onSceneMouseMove({
        type: 'mousemove',
        lnglat: this.mouseLngLat,
        lngLat: this.mouseLngLat,
      });
    }
  }

  /**
   * 根据子类实现的 getRenderTypes 方法，初始化对应的Render实例。
   */
  initRender(): RenderMap {
    const renderMap: RenderMap = {};
    const renderTypeList = this.getRenderTypes();

    for (const renderType of renderTypeList) {
      const Render = RENDER_MAP[renderType];
      const style = this.options.style[renderType];
      // @ts-ignore
      renderMap[renderType] = new Render(this.scene, {
        // @ts-ignore
        style,
      });
    }

    return renderMap;
  }

  /**
   * 光标在地图上移动时的回调，子类均会重写该方法
   * @param e
   */
  abstract onSceneMouseMove(e: ISceneMouseEvent): void;

  /**
   * 根据用户传入的options返回通用的options默认配置
   * @param options
   */
  getCommonOptions<F extends Feature = Feature>(options: DeepPartial<IBaseModeOptions>): IBaseModeOptions {
    return {
      initData: [] as F[],
      autoFocus: true,
      cursor: cloneDeep(DEFAULT_CURSOR_MAP),
      editable: true,
      style: cloneDeep(DEFAULT_STYLE),
      multiple: true,
      history: cloneDeep(DEFAULT_HISTORY_CONFIG),
      keyboard: cloneDeep(DEFAULT_KEYBOARD_CONFIG),
    } as IBaseModeOptions;
  }

  /**
   * 设置地图上光标样式类型
   * @param cursor
   */
  setCursor(cursor: ICursorType | null) {
    this.cursor.setCursor(cursor);
  }

  /**
   * 重置光标到常规状态
   */
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
    this.resetCursor();
    this.bindEnableEvent();
    this.scene.setMapStatus({
      doubleClickZoom: false,
    });
    setTimeout(() => {
      this.emit(DrawEvent.enable, this);
    }, 0);
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
    setTimeout(() => {
      this.emit(DrawEvent.disable, this);
    }, 0);
  }

  /**
   * 清空所有数据
   */
  clear(disable = false) {
    this.source.clear();
    this.emit(DrawEvent.clear, this);
    if (disable) {
      this.disable();
    }
  }

  /**
   * 显示该Drawer下所有图层
   */
  show() {
    return Object.values(this.render).forEach((render) => {
      render.show();
    });
  }

  /**
   * 隐藏该Drawer下所有图层
   */
  hide() {
    return Object.values(this.render).forEach((render) => {
      render.hide();
    });
  }

  /**
   * 销毁当前Drawer
   */
  destroy() {
    this.disable();
    this.clear(true);
    Object.values(this.render).forEach((render) => {
      render.destroy();
    });
    this.emit(DrawEvent.destroy, this);
  }
}
