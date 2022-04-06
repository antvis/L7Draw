import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { cloneDeep, debounce, last } from 'lodash';
import { DEFAULT_NODE_STYLE, DRAWER_STATUS, DrawerEvent } from '../constants';
import { Scene } from '@antv/l7';
import { NodeDrawer } from './NodeDrawer';
import { getUuid, isSameFeature, lineString } from '../utils';
import { coordAll, Position } from '@turf/turf';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {
  nodeDrawer: NodeDrawer;

  status = DRAWER_STATUS.NORMAL;

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

  get normalLayer() {
    return this.render.line?.layers[0];
  }

  constructor(scene: Scene, options: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);
    // TODO: 将line参数转换到nodeDrawerOptions中
    this.nodeDrawer = new NodeDrawer(scene, this.options);

    this.normalLayer?.on('unclick', this.onUnClick);
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

  onSceneMouseMove(e: ISceneMouseEvent) {
    if (
      this.editLine?.geometry?.coordinates.length &&
      this.status === DRAWER_STATUS.DRAW
    ) {
      const lastPoint = last(this.editLine?.geometry?.coordinates) as Position;
      const { lng, lat } = e.lnglat;
      this.source.setData({
        dashLine: [lineString([[lng, lat], lastPoint])],
      });
    }
  }

  onMouseMove({ feature }: ILayerMouseEvent) {
    if (this.status === DRAWER_STATUS.NORMAL) {
      this.setCursor('pointer');
      this.setData(data =>
        data.map(item => {
          if (isSameFeature(item, feature) && item.properties) {
            item.properties.isHover = true;
          }
          return item;
        }),
      );
    }
  }

  onMouseOut({ feature }: ILayerMouseEvent) {
    if (this.status === DRAWER_STATUS.NORMAL) {
      this.setCursor(null);
      this.setData(data =>
        data.map(item => {
          if (isSameFeature(item, feature) && item.properties) {
            item.properties.isHover = false;
          }
          return item;
        }),
      );
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

  onNodeClick(e: IPointFeature) {
    if (isSameFeature(last(this.nodes), e)) {
      this.drawFinish();
    } else {
      this.onNodeCreate(e);
    }
  }

  onClick({ feature }: ILayerMouseEvent) {
    if (this.status === DRAWER_STATUS.NORMAL) {
      this.setCursor('pointer');
      this.setData(data =>
        data.map(item => {
          if (isSameFeature(item, feature) && item.properties) {
            item.properties.isActive = true;
          }
          return item;
        }),
      );
    }
  }

  onUnClick() {
    if (this.status === DRAWER_STATUS.EDIT) {
      this.editLine = null;
      this.setData(data => data);
      this.nodes = [];
      this.status = DRAWER_STATUS.NORMAL;
    }
  }

  bindEvent() {
    this.scene.on('mousemove', this.onSceneMouseMove);
    this.nodeDrawer.on(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.on(DrawerEvent.click, this.onNodeClick);
    this.normalLayer?.on('mousemove', this.onMouseMove);
    this.normalLayer?.on('mouseout', this.onMouseOut);
    this.normalLayer?.on('click', this.onClick);
  }

  unbindEvent() {
    this.scene.off('mousemove', this.onSceneMouseMove);
    this.nodeDrawer.off(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.off(DrawerEvent.click, this.onNodeClick);
    this.normalLayer?.off('mousemove', this.onMouseMove);
    this.normalLayer?.off('mouseout', this.onMouseOut);
    this.normalLayer?.off('click', this.onClick);
  }

  drawFinish() {
    this.nodeDrawer.disable();
    const editLine = this.editLine;
    const newData: Partial<ISourceData> = {
      dashLine: [],
    };
    if (!this.options.autoFocus) {
      if (this.editLine?.properties) {
        this.editLine.properties.isHover = this.editLine.properties.isActive = false;
        newData.line = this.source.data.line;
      }
      this.nodes = [];
      this.status = DRAWER_STATUS.NORMAL;
    } else {
      this.status = DRAWER_STATUS.EDIT;
    }
    this.source.setData(newData);
    this.emit(DrawerEvent.add, editLine, this.getData());
  }

  enable() {
    super.enable();
    this.nodeDrawer.enable();
    this.status = DRAWER_STATUS.DRAW;
  }

  disable() {
    super.disable();
    this.drawFinish();
  }

  bindThis() {
    super.bindThis();
    this.onSceneMouseMove = debounce(this.onSceneMouseMove, 16, {
      maxWait: 16,
    }).bind(this);
    this.onNodeCreate = this.onNodeCreate.bind(this);
    this.onNodeClick = this.onNodeClick.bind(this);
    this.onUnClick = this.onUnClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClick = this.onClick.bind(this);
  }
}
