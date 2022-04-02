import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { cloneDeep, debounce, last } from 'lodash';
import { DEFAULT_NODE_STYLE, DrawerEvent } from '../constants';
import { Scene } from '@antv/l7';
import { NodeDrawer } from './NodeDrawer';
import { getUuid, isSameFeature, lineString } from '../utils';
import { coordAll, Position } from '@turf/turf';

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
    if (this.editLine?.geometry?.coordinates.length) {
      const lastPoint = last(this.editLine?.geometry?.coordinates) as Position;
      const { lng, lat } = e.lnglat;
      this.source.setData({
        dashLine: [lineString([[lng, lat], lastPoint])],
      });
    }
  }

  onNodeCreate(e: IPointFeature) {
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
    } else {
      const editLine = this.editLine;
      if (editLine?.geometry && e.geometry) {
        editLine.geometry.coordinates.push(e.geometry.coordinates);
        this.setData(data => data);
        this.emit(DrawerEvent.change, editLine, this.getData());
      }
    }
    this.nodeDrawer.options.editable = false;
  }

  onNodeClick(nodeFeature: IPointFeature) {
    if (isSameFeature(last(this.nodes), nodeFeature)) {
    } else {
    }
  }

  bindEvent() {
    this.scene.on('mousemove', this.onMouseMove);
    this.nodeDrawer.on(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.on(DrawerEvent.click, this.onNodeClick);
  }

  unbindEvent() {
    this.scene.off('mousemove', this.onMouseMove);
    this.nodeDrawer.off(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.off(DrawerEvent.click, this.onNodeClick);
  }

  bindThis() {
    super.bindThis();
    this.onMouseMove = debounce(this.onMouseMove, 16, { maxWait: 16 }).bind(
      this,
    );
    this.onNodeCreate = this.onNodeCreate.bind(this);
    this.onNodeClick = this.onNodeClick.bind(this);
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
