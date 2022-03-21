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

  normalLayer!: ILayer;
  hoverLayer!: ILayer;
  activeLayer!: ILayer;

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

  initLayers() {
    const { normal, hover, active } = this.style;
    this.normalLayer = this.initLayer(normal);
    this.hoverLayer = this.initLayer(hover);
    this.activeLayer = this.initLayer(active);
    return [this.normalLayer, this.hoverLayer, this.activeLayer];
  }

  abstract initLayer(style: IBaseStyleItem): ILayer;

  setData(features: IBaseFeature[]) {
    const { normal = [], hover = [], active = [] } = groupBy(
      features,
      feature => {
        const { isHover = false, isActive = false } = feature.properties ?? {};
        return isActive ? 'active' : isHover ? 'hover' : 'normal';
      },
    );
    this.normalLayer.setData(featureCollection(normal));
    this.hoverLayer.setData(featureCollection(hover));
    this.activeLayer.setData(featureCollection(active));
  }
}
