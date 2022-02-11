import EventEmitter from 'eventemitter3';
import { SourceEvent } from '../constants';
import {
  IBaseFeature,
  IRenderType,
  ISourceData,
  ISourceOptions,
  IRenderMap,
} from '../typings';

export class Source extends EventEmitter<SourceEvent> {
  data: ISourceData = {
    point: [],
    line: [],
    polygon: [],
  };

  render: IRenderMap = {};

  constructor({ data, render }: ISourceOptions) {
    super();

    this.render = render;

    if (data) {
      this.setData(data);
    }
  }

  getRender(type: IRenderType) {
    const targetRender = this.render[type];
    if (!targetRender) {
      throw new Error('当前render并未初始化，请检查Source构造器传参');
    }
    return targetRender;
  }

  setData(newData: Partial<ISourceData>) {
    const types = Object.keys(newData) as IRenderType[];
    if (types.length) {
      this.data = {
        ...this.data,
        ...newData,
      };

      types.forEach((type) => {
        const renderData = newData[type];
        if (Array.isArray(renderData)) {
          this.getRender(type).setData(renderData);
        }
      });

      this.emit(SourceEvent.change, this.data);
    }
  }

  isEmptyData() {
    return Object.values(this.data).every((value: IBaseFeature[]) => {
      return !value.length;
    });
  }
}
