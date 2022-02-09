import EventEmitter from 'eventemitter3';
import { IBaseFeature, IRenderOptions, IStyleItem } from '../typings';
import { ILayer, Scene } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export abstract class BaseRender<
  F extends IBaseFeature = IBaseFeature,
  S extends IStyleItem = IStyleItem,
> extends EventEmitter {
  layers: ILayer[] = [];
  style: S;
  scene: Scene;
  get mainLayer() {
    return this.layers[0] ?? null;
  }

  constructor(scene: Scene, { style }: IRenderOptions<F, S>) {
    super();
    this.scene = scene;
    this.style = style;
    this.layers = this.initLayers();

    this.layers.forEach((layer) => {
      this.scene.addLayer(layer);
    });
  }

  abstract initLayers(): ILayer[];

  setData(features: IBaseFeature[]) {
    this.layers.forEach((layer) => {
      layer.setData(featureCollection(features));
    });
  }
}
