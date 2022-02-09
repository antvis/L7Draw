import EventEmitter from 'eventemitter3';
import { SourceEvent } from '../constants';
import {
  IRenderType,
  ISourceData,
  ISourceOptions,
  ISourceRenderOptions,
  IStyle,
} from '../typings';
import { BaseRender } from '../render';
import { Scene } from '@antv/l7';

export class Source extends EventEmitter<SourceEvent> {
  scene: Scene;

  data: ISourceData = {
    point: [],
    line: [],
    polygon: [],
  };

  render: Partial<Record<IRenderType, BaseRender>> = {};

  constructor(scene: Scene, { data, render, style }: ISourceOptions) {
    super();

    this.scene = scene;
    this.initRender(render, style);

    if (data) {
      this.setData(data);
    }
  }

  initRender(render: ISourceRenderOptions, style: IStyle) {
    // if (render.point) {
    //   this.render.point = new BaseRender();
    // }
    // if (render.line) {
    //   this.render.line = new BaseRender();
    // }
    // if (render.polygon) {
    //   this.render.polygon = new BaseRender();
    // }
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
}
