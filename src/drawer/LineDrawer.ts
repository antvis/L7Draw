import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  ILngLat,
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
import {
  getUuid,
  isSameFeature,
  lineString,
  moveFeature,
  moveFeatureList,
} from '../utils';
import {
  center,
  coordAll,
  featureCollection,
  point,
  Position,
} from '@turf/turf';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {
  protected _previousLngLat: ILngLat = {
    lng: 0,
    lat: 0,
  };

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

    this.refreshMidPoint();
  }

  get editLine() {
    return this.getData().find(feature => feature.properties?.isActive) ?? null;
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

  get dragLine() {
    return this.getData().find(feature => feature.properties?.isDrag) ?? null;
  }

  set dragLine(newData: ILineFeature | null) {
    const lineRender = this.source.render.line;
    lineRender?.setData(
      lineRender?.data.map(feature => {
        if (feature.properties) {
          feature.properties.isDrag = newData
            ? isSameFeature(feature, newData)
            : false;
          return newData ?? feature;
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
    this.normalLayer?.on('mousedown', this.onMouseDown);
    this.nodeDrawer.on(DrawerEvent.dragging, this.onNodeDrag);
    this.nodeDrawer.on(DrawerEvent.dragEnd, this.onNodeDrag);
    this.scene?.on('mousemove', this.onSceneMouseMove);
    this.scene?.on('dragging', this.onDragging);
    this.scene?.on('mouseup', this.onMouseUp);
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
      const newLine = lineString(coordAll(e), {
        id: getUuid('line'),
        nodes: [e],
        isHover: true,
        isActive: true,
        isDrag: false,
      }) as ILineFeature;
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
    const editLine = this.editLine;
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
      editLine?.properties &&
      editLine?.geometry
    ) {
      nodes.splice(
        endIndex,
        0,
        point(feature.geometry.coordinates, {
          id: getUuid('point'),
          isHover: false,
          isActive: false,
          isDrag: false,
        }) as IPointFeature,
      );
      this.nodes = nodes;
      editLine.properties.nodes = nodes;
      // @ts-ignore
      editLine.geometry.coordinates = nodes.map(
        node => node.geometry?.coordinates,
      );
    }
  }

  onMouseDown(e: ILayerMouseEvent<ILineFeature>) {
    const { feature, lngLat } = e;
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

    if (this.status === DRAWER_STATUS.EDIT) {
      this.dragLine = this.editLine;
      this.scene.setMapStatus({
        dragEnable: false,
      });
      this._previousLngLat = lngLat;
    }
  }

  onSceneMouseMove({ lnglat }: ISceneMouseEvent) {
    const { lng, lat } = lnglat;
    if (
      this.editLine?.geometry?.coordinates.length &&
      this.status === DRAWER_STATUS.DRAW
    ) {
      const lastPoint = last(this.editLine?.geometry?.coordinates) as Position;
      this.source.setData({
        dashLine: [lineString([[lng, lat], lastPoint]) as ILineFeature],
      });
    }
  }

  onDragging({ lngLat }: ILayerMouseEvent) {
    if (this.status === DRAWER_STATUS.EDIT && this.dragLine) {
      this.setCursor('move');
      const newDragLine = moveFeature(
        this.dragLine,
        this._previousLngLat,
        lngLat,
      );
      if (newDragLine.properties) {
        newDragLine.properties.nodes = moveFeatureList(
          newDragLine.properties.nodes,
          this._previousLngLat,
          lngLat,
        );
        this.nodes = newDragLine.properties.nodes;
        this.refreshMidPoint();
      }
      this.setData(features => {
        return features.map(feature => {
          if (isSameFeature(newDragLine, feature)) {
            return newDragLine;
          }
          return feature;
        });
      });
      this._previousLngLat = lngLat;
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

  onMouseUp(e: ISceneMouseEvent) {
    if (this.dragLine) {
      this.setCursor('pointer');
      this.dragLine = null;
      this.scene.setMapStatus({
        dragEnable: true,
      });
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
        this.refreshMidPoint();
      }
    }
  }

  refreshMidPoint() {
    const nodes = this.nodes;
    const midPointList: IMidPointFeature[] = [];
    if (this.status === DRAWER_STATUS.EDIT && nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const newPoint: IMidPointFeature = Object.assign(
          center(featureCollection([nodes[i], nodes[i + 1]])),
          {
            properties: {
              id: getUuid('midPoint'),
              isHover: false,
              isActive: false,
              isDrag: false,
              startId: nodes[i].properties?.id ?? '',
              endId: nodes[i + 1].properties?.id ?? '',
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
    this.nodeDrawer.options.editable = true;
    if (!this.options.autoFocus) {
      this.status = DRAWER_STATUS.NORMAL;
    } else {
      this.status = DRAWER_STATUS.EDIT;
      this.refreshMidPoint();
    }
    this.source.setData(newData);
    this.emit(DrawerEvent.add, editLine, this.getData());
  }

  enable() {
    super.enable();
    this.nodeDrawer.enable();
    this.status = DRAWER_STATUS.DRAW;
    this.nodeDrawer.options.editable = false;
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
    this.onDragging = debounce(this.onDragging, 16, {
      maxWait: 16,
    }).bind(this);
    this.onNodeCreate = this.onNodeCreate.bind(this);
    this.onNodeClick = this.onNodeClick.bind(this);
    this.onUnClick = this.onUnClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDragging = this.onDragging.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onNodeDrag = this.onNodeDrag.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
  }
}
