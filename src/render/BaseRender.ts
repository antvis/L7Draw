import EventEmitter from 'eventemitter3';
import {
  IBaseFeature,
  IRenderOptions,
  IBaseStyle,
} from '../typings';
import { ILayer, Scene } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export abstract class BaseRender<
  F extends IBaseFeature = IBaseFeature,
  S extends IBaseStyle = IBaseStyle
> extends EventEmitter {
  layers: ILayer[] = [];
  style: S;
  scene: Scene;
  data: F[] = [];

  constructor(scene: Scene, { style }: IRenderOptions<F, S>) {
    super();
    this.scene = scene;
    this.style = style;
    this.layers = this.initLayers();

    this.layers.forEach(layer => {
      this.scene.addLayer(layer);
    });

    if (typeof style.callback === 'function') {
      style.callback(this.layers);
    }
  }

  abstract initLayers(): ILayer[];

  setData(features: F[]) {
    this.data = features;
    const newData = featureCollection(features);
    this.layers.forEach(layer => {
      layer.setData(newData);
    });
  }
}
