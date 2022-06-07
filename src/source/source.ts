import {
  FeatureUpdater,
  IBaseFeature,
  IRenderType,
  RenderMap,
  SourceData,
  SourceOptions,
} from '../typings';
import { SourceEvent } from '../constant';
import { BaseRender } from '../render';
import EventEmitter from 'eventemitter3';
import { fromPairs } from 'lodash';

export class Source extends EventEmitter<SourceEvent> {
  /**
   * 用于存储渲染器render映射
   * @protected
   */
  protected render: RenderMap;

  /**
   * 用于存储当前最新数据
   * @protected
   */
  protected data: SourceData = {
    point: [],
    line: [],
    polygon: [],
    midPoint: [],
    dashLine: [],
    text: [],
  };

  /**
   * 存储当前延迟更新函数的timeout
   * @protected
   */
  protected timeout: number | null = null;

  /**
   * 用于需要待更新的renderType以及对应的最新数据
   * @protected
   */
  protected diffData: Partial<SourceData> = {};

  constructor({ data, render }: SourceOptions) {
    super();

    this.render = render;
    if (data) {
      this.setData(data);
    }
  }

  /**
   * 更新数据的方法，新的数据会累积延迟更新
   * @param data
   */
  setData(data: Partial<SourceData>) {
    if (Object.keys(data).length) {
      this.data = {
        ...this.data,
        ...data,
      };

      this.diffData = {
        ...this.diffData,
        ...data,
      };

      if (!this.timeout) {
        this.timeout = setTimeout(() => this.updateDiffData(), 16);
      }

      this.emit(SourceEvent.change, {
        data: this.data,
      });
    }
    return this.data;
  }

  /**
   * 获取全量source数据
   */
  getData() {
    return this.data;
  }

  /**
   * 获取单项source数据
   * @param renderType
   */
  getRenderData<F extends IBaseFeature>(renderType: IRenderType) {
    return this.data[renderType] as unknown as F[];
  }

  /**
   * 设置单项
   * @param renderType
   * @param updater
   */
  setRenderData<F extends IBaseFeature>(
    renderType: IRenderType,
    updater: FeatureUpdater<F>,
  ) {
    const data =
      typeof updater === 'function'
        ? updater(this.getRenderData(renderType))
        : updater;
    this.setData({
      [renderType]: data,
    });
    this.emit(SourceEvent.change, this.data);
    return data;
  }

  /**
   * 根据当前diffData中积累的数据更新对应render
   */
  updateDiffData() {
    const renderTypes = Object.entries(this.diffData) as [
      IRenderType,
      IBaseFeature[],
    ][];
    if (renderTypes.length) {
      renderTypes.forEach(([renderType, renderData]) => {
        if (Array.isArray(renderData)) {
          this.getRender(renderType).setData(renderData);
        }
      });
      this.emit(SourceEvent.update, this.data, this.diffData);
      this.diffData = {};
      this.timeout = null;
    }
  }

  /**
   * 获取对应renderType类型的render实例，如果没有获取到则代表
   * @param type
   */
  getRender<R extends BaseRender = BaseRender>(type: IRenderType): R {
    const render = this.render[type];
    if (!render) {
      throw new Error(
        '当前render并未初始化，请检查 getRenderTypes 方法实现问题',
      );
    }
    return render as R;
  }

  /**
   * 清空所有数据
   */
  clear() {
    this.setData(
      fromPairs(Object.keys(this.render).map((renderType) => [renderType, []])),
    );
  }
}
