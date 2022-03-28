import {
  DeepPartial,
  IDrawerOptions,
  ILineFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { cloneDeep } from 'lodash';
import { DEFAULT_NODE_STYLE, DrawerEvent } from '../constants';
import { Scene } from '@antv/l7';
import { NodeDrawer } from './NodeDrawer';
import { getUuid, isSameFeature } from '../utils';
import { coordAll, lineString } from '@turf/turf';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {
  nodeDrawer: NodeDrawer;

  get nodes() {
    return this.nodeDrawer.getData();
  }

  set nodes(newData) {
    this.nodeDrawer.setData(newData);
  }

  get editLine() {
    return (
      this.source.data.line.find(feature => feature.properties?.isActive) ??
      null
    );
  }

  set editLine(newData: ILineFeature | null) {
    const lineRender = this.source.render.line;
    lineRender?.setData(
      lineRender?.data.map(feature => {
        if (feature.properties) {
          feature.properties.isActive = newData
            ? isSameFeature(feature, newData)
            : false;
        }
        return feature;
      }) ?? [],
    );
  }

  constructor(scene: Scene, options: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);
    // TODO: 将line参数转换到nodeDrawerOptions中
    this.nodeDrawer = new NodeDrawer(scene, this.options);
  }

  getData(): ILineFeature[] {
    return this.source.data.line;
  }

  setData(
    updater: ILineFeature[] | ((_: ILineFeature[]) => ILineFeature[]),
    store = false,
  ) {
    const line =
      typeof updater === 'function' ? updater(this.getData()) : updater;
    this.source.setData(
      {
        line,
      },
      store,
    );
  }

  getDefaultOptions(): ILineDrawerOptions {
    const defaultOptions = this.getCommonOptions();
    defaultOptions.style.point = cloneDeep(DEFAULT_NODE_STYLE);
    return defaultOptions;
  }

  getRenderList(): IRenderType[] {
    return ['line', 'dashLine'];
  }

  onMouseMove(e: ISceneMouseEvent) {
    // if (!this.nodes.length) {
    //   return;
    // }
    // console.log(this);
  }

  onNodeCreate(e: IPointFeature) {
    console.log(coordAll(e));
    // 首次创建节点，创建线路
    if (this.nodes.length === 1) {
      const newLine: ILineFeature = lineString(coordAll(e), {
        id: getUuid('line'),
        isHover: true,
        isActive: true,
        isDrag: false,
      });
      this.setData(data => [...data, newLine]);
      this.emit(DrawerEvent.add, newLine, this.getData());
    }
  }

  bindEvent() {
    this.scene.on('mousemove', this.onMouseMove);
    this.nodeDrawer.on(DrawerEvent.add, this.onNodeCreate);
  }

  unbindEvent() {
    this.scene.off('mousemove', this.onMouseMove);
    this.nodeDrawer.off(DrawerEvent.add, this.onNodeCreate);
  }

  bindThis() {
    super.bindThis();
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onNodeCreate = this.onNodeCreate.bind(this);
  }

  enable() {
    super.enable();
    this.nodeDrawer.enable();
  }

  disable() {
    super.disable();
    this.nodeDrawer.disable();
  }
}
