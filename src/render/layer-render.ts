import { ILayer, Scene } from '@antv/l7';
import { featureCollection } from '@turf/turf';
import { EventEmitter } from 'eventemitter3';
import { RenderEvent } from '../constant';
import { IBaseFeature, IBaseStyle, IRenderOptions } from '../typings';

export abstract class LayerRender<
  F extends IBaseFeature = IBaseFeature,
  S extends IBaseStyle = IBaseStyle,
> extends EventEmitter<RenderEvent | keyof typeof RenderEvent> {
  /**
   * 地图场景Scene的实例
   */
  protected scene: Scene;

  /**
   * 样式配置
   */
  protected style: S;

  /**
   * 图层列表
   */
  protected layers: ILayer[];

  /**
   * 当前展示的数据
   */
  protected data: F[] = [];

  constructor(scene: Scene, { style }: IRenderOptions<S>) {
    super();

    this.scene = scene;
    this.style = style;
    this.layers = this.initLayers();

    this.layers.forEach((layer) => {
      scene.addLayer(layer);
      // layer.active(true);
    });

    if (style.callback instanceof Function) {
      style.callback(this.layers);
    }
  }

  /**
   * 子类继承时需要实现该方法并返回对应的layer数组
   */
  abstract initLayers(): ILayer[];

  getLayers() {
    return this.layers;
  }

  /**
   * 显示所有图层
   */
  show() {
    this.layers.forEach((layer) => {
      layer.show();
    });
  }

  /**
   * 隐藏所有图层
   */
  hide() {
    this.layers.forEach((layer) => {
      layer.hide();
    });
  }

  /**
   * 设置数据
   * @param features 设置对应的Feature数组
   */
  setData(features: F[]) {
    this.data = features;
    const newData = featureCollection(features);
    this.layers.forEach((layer) => {
      layer.setData(newData, {
        autoRender: false,
      });
    });
  }

  /**
   * render销毁时，需要把图层从Scene中移除
   */
  destroy() {
    this.layers.forEach((layer) => {
      this.scene.removeLayer(layer);
    });
  }
}
