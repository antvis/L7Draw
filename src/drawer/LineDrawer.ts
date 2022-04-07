import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
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
import {
  center,
  coordAll,
  featureCollection,
  midpoint,
  point,
  Position,
} from '@turf/turf';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {
  protected nodeDrawer: NodeDrawer;

  protected _status = DRAWER_STATUS.NORMAL;

  get status() {
    return this._status;
  }

  set status(newStatus: DRAWER_STATUS) {
    if (newStatus === DRAWER_STATUS.NORMAL) {
      this.nodes = [];
      this.source.setData({
        line: this.getData().map(item => {
          if (item.properties) {
            item.properties.isActive = item.properties.isHover = false;
          }
          return item;
        }),
        dashLine: [],
      });
      this.nodeDrawer.unbindEditEvent();
    } else if (newStatus === DRAWER_STATUS.DRAW) {
    } else if (newStatus === DRAWER_STATUS.EDIT) {
      this.nodeDrawer.bindEditEvent();
    }
    this._status = newStatus;
  }

  get nodes() {
    return this.nodeDrawer.getData();
  }

  set nodes(newNodes) {
    this.nodeDrawer.setData(newNodes);

    const midPointList: IMidPointFeature[] = [];
    if (this.status === DRAWER_STATUS.EDIT && newNodes.length > 1) {
      for (let i = 0; i < newNodes.length - 1; i++) {
        const newPoint: IMidPointFeature = Object.assign(
          center(featureCollection([newNodes[i], newNodes[i + 1]])),
          {
            properties: {
              id: getUuid('midPoint'),
              isHover: false,
              isActive: false,
              isDrag: false,
              startId: newNodes[i].properties?.id ?? '',
              endId: newNodes[i + 1].properties?.id ?? '',
            },
          },
        );
        midPointList.push(newPoint);
      }
    }
    this.source.setData({
      midPoint: midPointList,
    });
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
    this.normalLayer?.on('mousemove', this.onMouseMove);
    this.normalLayer?.on('mouseout', this.onMouseOut);
    this.normalLayer?.on('click', this.onClick);
    this.nodeDrawer.on(DrawerEvent.dragging, this.onNodeDrag);
    this.nodeDrawer.on(DrawerEvent.dragEnd, this.onNodeDrag);
    this.render.midPoint?.layers[0]?.on('click', this.onMidPointClick);
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
    return ['line', 'dashLine', 'midPoint'];
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

  onMouseOut({ feature }: ILayerMouseEvent) {
    this.setCursor(null);
    this.setData(data =>
      data.map(item => {
        if (isSameFeature(item, feature) && item.properties) {
          console.log('bingo');
          item.properties.isHover = false;
        }
        return item;
      }),
    );
  }

  onNodeCreate(e: IPointFeature) {
    // 首次创建节点，创建线路
    if (this.nodes.length === 1) {
      const newLine: ILineFeature = lineString(coordAll(e), {
        id: getUuid('line'),
        nodes: [e],
        isHover: true,
        isActive: true,
        isDrag: false,
      });
      this.source.setData({
        line: [...this.getData(), newLine],
        dashLine: [],
      });
      this.emit(DrawerEvent.add, newLine, this.getData());
    } else {
      const editLine = this.editLine;
      if (editLine?.geometry && e.geometry && editLine.properties) {
        editLine.geometry.coordinates.push(e.geometry.coordinates);
        editLine.properties.nodes.push(e);
        this.source.setData({
          line: this.getData(),
          dashLine: [],
        });
        this.emit(DrawerEvent.change, editLine, this.getData());
      }
    }
  }

  onNodeClick(e: IPointFeature) {
    if (this.status === DRAWER_STATUS.DRAW) {
      if (isSameFeature(last(this.nodes), e)) {
        this.drawFinish();
      } else {
        this.onNodeCreate(e);
      }
    }
  }

  onMidPointClick({ feature }: ILayerMouseEvent<IMidPointFeature>) {
    const nodes = [...this.nodes];
    const { startId, endId } = feature?.properties ?? {};
    const startIndex = nodes.findIndex(
      feature => feature.properties?.id === startId,
    );
    const endIndex = nodes.findIndex(
      feature => feature.properties?.id === endId,
    );
    if (
      startIndex > -1 &&
      endIndex > -1 &&
      feature?.geometry &&
      this.editLine?.geometry
    ) {
      nodes.splice(
        endIndex,
        0,
        point(feature.geometry.coordinates, {
          id: getUuid('point'),
          isHover: false,
          isActive: false,
          isDrag: false,
        }),
      );
      this.nodes = nodes;
      // @ts-ignore
      this.editLine.geometry.coordinates = nodes.map(
        node => node.geometry?.coordinates,
      );
    }
  }

  onClick({ feature }: ILayerMouseEvent<ILineFeature>) {
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
      this.status = DRAWER_STATUS.EDIT;
      this.nodes = feature?.properties?.nodes ?? [];
    }
  }

  onUnClick() {
    if (this.status === DRAWER_STATUS.EDIT) {
      this.status = DRAWER_STATUS.NORMAL;
    }
  }

  onNodeDrag(e: IPointFeature) {
    const editLine = this.editLine;
    if (
      this.status === DRAWER_STATUS.EDIT &&
      editLine &&
      editLine.properties &&
      editLine.geometry
    ) {
      const targetIndex = editLine.properties.nodes.findIndex(node =>
        isSameFeature(node, e),
      );
      if (targetIndex > -1) {
        editLine.properties.nodes[targetIndex] = e;
        editLine.geometry.coordinates = coordAll(
          featureCollection(editLine.properties.nodes),
        );
        this.editLine = editLine;
      }
    }
  }

  bindEvent() {
    this.scene.on('mousemove', this.onSceneMouseMove);
    this.nodeDrawer.on(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.on(DrawerEvent.click, this.onNodeClick);
  }

  unbindEvent() {
    this.scene.off('mousemove', this.onSceneMouseMove);
    this.nodeDrawer.off(DrawerEvent.add, this.onNodeCreate);
    this.nodeDrawer?.off(DrawerEvent.click, this.onNodeClick);
  }

  drawFinish() {
    this.nodeDrawer.disable();
    const editLine = this.editLine;
    const newData: Partial<ISourceData> = {
      dashLine: [],
    };
    if (!this.options.autoFocus) {
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
    this.onNodeDrag = this.onNodeDrag.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
  }
}
