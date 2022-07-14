import { Scene } from '@antv/l7';
import { Feature } from '@turf/turf';
import EventEmitter from 'eventemitter3';
import { cloneDeep, debounce, isEqual, merge } from 'lodash';
import Mousetrap from 'mousetrap';
import {
  DEFAULT_CURSOR_MAP,
  DEFAULT_HISTORY_CONFIG,
  DEFAULT_KEYBOARD_CONFIG,
  DEFAULT_STYLE,
  DrawEvent,
  RENDER_MAP,
  RenderEvent,
  SceneEvent,
} from '../constant';
import { Cursor, Popup } from '../interactive';
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
  PopupContent,
  RenderMap,
} from '../typings';
import { getLngLat, isSameFeature } from '../utils';

export abstract class BaseMode<
  O extends IBaseModeOptions = IBaseModeOptions,
> extends EventEmitter<DrawEvent | keyof typeof DrawEvent> {
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
  protected enabled = false;

  // 在 enable 时传入，用于判断当前是否支持添加操作
  protected allowCreate = false;

  /**
   * scene相关事件管理
   * @protected
   */
  protected sceneRender: SceneRender;

  /**
   * 光标在地图上的经纬度位置
   * @protected
   */
  protected mouseLngLat: ILngLat = {
    lng: 0,
    lat: 0,
  };

  protected popup?: Popup;

  /**
   * 本次enable添加的绘制物个数
   * @protected
   */
  protected addCount = 0;

  /**
   * 当期是否可以添加新的绘制物
   */
  get addable() {
    const data = this.getData();
    const { multiple, maxCount } = this.options;
    const drawItem = data.find((item) => item.properties.isDraw);
    if (!this.enabled || !this.allowCreate) {
      return false;
    }
    if ((multiple && maxCount <= 0) || drawItem) {
      return true;
    }
    if (!multiple && this.addCount >= 1) {
      return false;
    }
    if (maxCount > 0 && data.length >= maxCount) {
      return false;
    }
    return true;
  }

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

    const { initialData, popup } = this.options;
    if (initialData) {
      this.setData(initialData);
    }

    if (popup) {
      this.popup = new Popup(scene, popup instanceof Object ? popup : {});
    }

    this.saveHistory();
    this.bindCommonEvent();
    this.emit(DrawEvent.Init, this);
    this.bindEnableEvent();
  }

  protected abstract get dragItem(): Feature | null | undefined;

  protected abstract get editItem(): Feature | null | undefined;

  /**
   * 获取当前options配置的方法
   */
  getOptions() {
    return this.options;
  }

  /**
   * 获取当前激活的绘制项
   */
  getEditItem() {
    return this.editItem;
  }

  /**
   * 获取当前正在被拖拽的绘制项
   */
  getDragItem() {
    return this.dragItem;
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

  setHelper(type: PopupContent | keyof O['helper'] | null) {
    const { helper } = this.options;
    if (!helper) {
      return;
    }
    // @ts-ignore
    const content = (type in helper ? helper[type] : type) ?? null;
    this.popup?.setContent(content);
  }

  /**
   * 获取当前是否为编辑态
   */
  isEnable() {
    return this.enabled;
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
    this.removeActiveFeature = this.removeActiveFeature.bind(this);
    this.bindCommonEvent = this.bindCommonEvent.bind(this);
    this.bindEnableEvent = this.bindEnableEvent.bind(this);
    this.unbindEnableEvent = this.unbindEnableEvent.bind(this);
    this.setActiveFeature = this.setActiveFeature.bind(this);
  }

  bindCommonEvent() {
    this.on(DrawEvent.Add, this.emitChangeEvent);
    this.on(DrawEvent.Add, () => {
      this.addCount++;
    });
    this.on(DrawEvent.Edit, this.emitChangeEvent);
    this.on(DrawEvent.Remove, this.emitChangeEvent);
    this.on(DrawEvent.Clear, this.emitChangeEvent);
    this.on(DrawEvent.AddNode, this.saveHistory);
    this.on(DrawEvent.RemoveNode, this.emitChangeEvent);
  }

  /**
   * 监听通用事件
   */
  bindEnableEvent() {
    this.unbindKeyboardEvent();
    this.scene.setMapStatus({
      doubleClickZoom: false,
    });
    this.scene.on(SceneEvent.Mousemove, this.saveMouseLngLat);

    this.bindKeyboardEvent();
  }

  /**
   * 监听通用事件
   */
  unbindEnableEvent() {
    this.scene.setMapStatus({
      doubleClickZoom: true,
    });
    this.scene.off(SceneEvent.Mousemove, this.saveMouseLngLat);
    this.unbindKeyboardEvent();
  }

  // 快捷键绑定
  bindKeyboardEvent() {
    const { revert, redo, remove } = this.options.keyboard || {};
    remove && Mousetrap.bind(remove, this.removeActiveFeature);
    if (this.options.history) {
      revert && Mousetrap.bind(revert, this.revertHistory);
      redo && Mousetrap.bind(redo, this.redoHistory);
    }
  }

  // 快捷键解绑
  unbindKeyboardEvent() {
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
    this.emit(DrawEvent.Change, this.getData());
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
    if (!this.enabled || !this.options.history) {
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
    if (!this.enabled || !this.options.history) {
      return;
    }
    if (this.source.redoHistory()) {
      this.correctDrawItem();
    }
  }

  // 传入 Feature 或者 id 获取当前数据中的目标 Feature
  getTargetFeature(
    target: Feature | string | null | undefined,
    data = this.getData(),
  ) {
    let targetFeature: IBaseFeature | null = null;
    if (target) {
      targetFeature =
        data.find(
          (feature) =>
            feature.properties.id ===
            (typeof target === 'string' ? target : target.properties?.id),
        ) ?? null;
      if (!targetFeature && target instanceof Object) {
        targetFeature =
          data.find((feature) => isEqual(target.geometry, feature.geometry)) ??
          null;
      }
    }
    return targetFeature;
  }

  // 设置激活的 Feature
  abstract setActiveFeature(target: Feature | string | null | undefined): void;

  // 清除当前正在绘制中的绘制物，同时将当前激活态的绘制物置为普通态
  abstract resetFeatures(): void;

  /**
   * 删除当前active的绘制物
   */
  removeActiveFeature() {
    const activeItem = this.getData().find((item) => {
      const { isActive, isDraw } = item.properties;
      return isActive || isDraw;
    });
    if (activeItem) {
      this.removeFeature(activeItem);
    }
    return activeItem;
  }

  /**
   * 删除指定
   * @param target
   */
  removeFeature(target: Feature | string) {
    const data = this.getData();
    const targetFeature = this.getTargetFeature(target);
    if (targetFeature) {
      // @ts-ignore
      this.setData(
        data.filter((feature) => !isSameFeature(targetFeature, feature)),
      );
      this.emit(DrawEvent.Remove, target, this.getData());
    }
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
  getCommonOptions<F extends Feature = Feature>(
    options: DeepPartial<IBaseModeOptions>,
  ): IBaseModeOptions {
    return {
      initialData: [] as F[],
      autoActive: true,
      cursor: cloneDeep(DEFAULT_CURSOR_MAP),
      editable: true,
      style: cloneDeep(DEFAULT_STYLE),
      multiple: true,
      history: cloneDeep(DEFAULT_HISTORY_CONFIG),
      keyboard: cloneDeep(DEFAULT_KEYBOARD_CONFIG),
      popup: true,
      helper: {},
      maxCount: -1,
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
    this.setCursor(this.addable ? 'draw' : null);
  }

  /**
   * 启用 Drawer
   * @param allowCreate 是否支持添加操作
   */
  enable(allowCreate = true) {
    this.allowCreate = allowCreate;
    this.setHelper(this.addable ? 'draw' : null);
    this.resetCursor();
    this.enabled = true;
    this.bindEnableEvent();
    this.addCount = 0;
    setTimeout(() => {
      this.emit(DrawEvent.Enable, this);
    }, 0);
  }

  /**
   * 禁用Drawer
   */
  disable() {
    this.resetFeatures();
    this.enabled = false;
    this.setCursor(null);
    this.unbindEnableEvent();
    this.addCount = 0;
    this.setHelper(null);
    setTimeout(() => {
      this.emit(DrawEvent.Disable, this);
    }, 0);
  }

  /**
   * 清空所有数据
   */
  clear(disable = false) {
    this.source.clear();
    this.emit(DrawEvent.Clear, this);
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
    Object.values(this.render).forEach((render) => {
      render.destroy();
    });
    Object.values(RenderEvent).forEach((EventName) => {
      Object.values(this.render).forEach((render) => {
        render.removeAllListeners(EventName);
      });
      this.sceneRender.removeAllListeners(EventName);
    });
    setTimeout(() => {
      Object.values(DrawEvent).forEach((EventName) => {
        this.removeAllListeners(EventName);
      });
    }, 0);
    this.emit(DrawEvent.Destroy, this);
  }
}
