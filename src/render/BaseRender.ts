import EventEmitter from 'eventemitter3';
import {
  IBaseFeature,
  IRenderOptions,
  IBaseStyle,
  IBaseStyleItem,
} from '../typings';
import { ILayer, Scene } from '@antv/l7';
import { feature, featureCollection } from '@turf/turf';
import { groupBy } from 'lodash';

export abstract class BaseRender<
  F extends IBaseFeature = IBaseFeature,
  S extends IBaseStyle = IBaseStyle
> extends EventEmitter {
  layers: ILayer[] = [];
  style: S;
  scene: Scene;

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

  setData(features: IBaseFeature[]) {
    const newData = featureCollection(features);
    this.layers.forEach(layer => {
      layer.setData(newData);
    });
  }
}
