import EventEmitter from 'eventemitter3';
import {
  IBaseFeature,
  IBaseStyle,
  IRenderOptions,
  IStyleItem,
} from '../typings';
import { ILayer, Scene } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export abstract class BaseRender<
  F extends IBaseFeature = IBaseFeature,
  S extends IStyleItem = IStyleItem,
> extends EventEmitter {
  layers: ILayer[] = [];
  style: S;
  scene: Scene;

  constructor(scene: Scene, { data, style }: IRenderOptions<F, S>) {
    super();
    this.scene = scene;
    this.style = style;
    this.layers = this.initLayers();

    if (data?.length) {
      this.setData(data);
    }
  }

  get layer() {
    return this.layers[0];
  }

  abstract initLayers(): ILayer[];

  setData(features: IBaseFeature[]) {
    this.layers.forEach((layer) => {
      layer.setData(featureCollection(features));
    });
  }
}
