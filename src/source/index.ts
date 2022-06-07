import EventEmitter from 'eventemitter3';
import { DEFAULT_SOURCE_DATA, SourceEvent } from '../constants';
import {
  IBaseFeature,
  IRenderMap,
  IRenderType,
  ISourceData,
  ISourceOptions,
} from '../typings';
import { fromPairs } from 'lodash';

export class Source extends EventEmitter<SourceEvent> {
  // 数据
  data: ISourceData = {
    ...DEFAULT_SOURCE_DATA,
  };

  diffData: Partial<ISourceData> = {};

  timeout: number | null = null;

  // 渲染器对象
  render: IRenderMap = {};

  constructor({ data, render }: ISourceOptions) {
    super();

    this.render = render;

    if (data) {
      this.setData(data, true);
    }
  }

  getRender(type: IRenderType) {
    const targetRender = this.render[type];
    if (!targetRender) {
      throw new Error('当前render并未初始化，请检查Source构造器传参');
    }
    return targetRender;
  }

  setData(newData: Partial<ISourceData>, store = false) {
    if (Object.keys(newData).length) {
      this.data = {
        ...this.data,
        ...newData,
      };

      if (store) {
        // TODO: 存储数据
      }

      this.diffData = {
        ...this.diffData,
        ...newData,
      };

      if (!this.timeout) {
        this.timeout = setTimeout(() => this.updateData(), 0);
      }

      this.emit(SourceEvent.change, this.data);
    }
  }

  updateData() {
    const renderTypes = Object.keys(this.diffData) as IRenderType[];
    if (renderTypes.length) {
      renderTypes.forEach((renderType) => {
        const renderData = this.diffData[renderType];
        if (Array.isArray(renderData)) {
          // @ts-ignore
          this.getRender(renderType).setData(renderData);
        }
      });
      this.diffData = {};
      this.timeout = null;
    }
  }

  clear() {
    this.setData(
      fromPairs(Object.keys(this.render).map((renderType) => [renderType, []])),
    );
  }

  isEmptyData() {
    return Object.values(this.data).every((value: IBaseFeature[]) => {
      return !value.length;
    });
  }
}
