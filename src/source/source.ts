import EventEmitter from 'eventemitter3';
import { cloneDeep, fromPairs } from 'lodash';
import { DEFAULT_SOURCE_DATA, SourceEvent } from '../constant';
import { LayerRender } from '../render';
import {
  FeatureUpdater,
  IBaseFeature,
  IRenderType,
  RenderMap,
  SourceData,
  SourceOptions,
} from '../typings';
import { History } from './history';
import { Scene } from '@antv/l7';

export class Source extends EventEmitter<
  SourceEvent | keyof typeof SourceEvent
> {
  protected scene: Scene;
  /**
   * 用于存储渲染器render映射
   * @protected
   */
  protected render: RenderMap;

  /**
   * 用于存储当前最新数据
   * @protected
   */
  protected data: SourceData = cloneDeep(DEFAULT_SOURCE_DATA);

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

  /**
   *
   * @protected
   */
  protected history?: History;

  constructor({ data, render, history: historyConfig, scene }: SourceOptions) {
    super();

    this.scene = scene;
    this.render = render;
    if (historyConfig) {
      this.history = new History({
        config: historyConfig,
      });
    }
    if (data) {
      this.setData(data);
    }
  }

  saveHistory() {
    return this.history?.save(this.data);
  }

  revertHistory() {
    const data = this.history?.revert();
    if (data) {
      this.setData(data);
      return data;
    }
  }

  redoHistory() {
    const data = this.history?.redo();
    if (data) {
      this.setData(data);
      return data;
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
        this.timeout = requestAnimationFrame(() => this.updateDiffData());
      }

      this.emit(SourceEvent.Change, {
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
      [renderType]: [...data].sort((a, b) => {
        // @ts-ignore
        return +a.properties.isActive - +b.properties.isActive;
      }),
    });
    this.emit(SourceEvent.Change, this.data);
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
          this.getRender(renderType)?.setData(renderData);
        }
      });
      this.emit(SourceEvent.Update, this.data, this.diffData);
      this.diffData = {};
      this.timeout = null;
      requestAnimationFrame(() => {
        this.scene.render();
      });
    }
  }

  /**
   * 获取对应renderType类型的render实例，如果没有获取到则代表
   * @param type
   */
  getRender<R extends LayerRender = LayerRender>(
    type: IRenderType,
  ): R | undefined {
    return this.render[type] as R | undefined;
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
