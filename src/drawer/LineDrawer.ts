import {
  DeepPartial,
  IDashLineFeature,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import { BasePointDrawer } from './BasePointDrawer';
import {
  calcMidPointList,
  debounceMoveFn,
  getUuid,
  isSameFeature,
  lineString,
} from '../utils';
import { coordAll, featureCollection, point } from '@turf/turf';
import { last } from 'lodash';
import { RenderEvent } from '../constants';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BasePointDrawer<ILineDrawerOptions> {
  get editLine() {
    return this.source.data.line.find(feature => {
      const { isActive, isDraw } = feature.properties;
      return isActive && !isDraw;
    });
  }

  get drawLine() {
    return (
      this.source.data.line.find(feature => feature.properties.isDraw) ?? null
    );
  }

  get midPointRender() {
    return this.render.midPoint;
  }

  constructor(scene: Scene, options?: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.click, this.onPointClick);
    this.midPointRender?.on(RenderEvent.click, this.onMidPointClick);
    this.midPointRender?.on(RenderEvent.mousemove, this.onMidPointMouseMove);
    this.midPointRender?.on(RenderEvent.mouseout, this.onMidPointMouseOut);
  }

  getLineData() {
    return this.getTypeData<ILineFeature>('line');
  }

  setLineData(
    updater: ILineFeature[] | ((features: ILineFeature[]) => ILineFeature[]),
    store = true,
  ) {
    return this.setTypeData<ILineFeature>('line', updater, store);
  }

  getDashLineData() {
    return this.getTypeData<IDashLineFeature>('dashLine');
  }

  setDashLineData(
    updater:
      | IDashLineFeature[]
      | ((features: IDashLineFeature[]) => IDashLineFeature[]),
    store = true,
  ) {
    return this.setTypeData<IDashLineFeature>('dashLine', updater, store);
  }

  getDefaultOptions(): ILineDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['line', 'dashLine', 'midPoint', 'point'];
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>) {
    if (this.editLine) {
      return;
    }

    super.onPointCreate(e);

    const feature = e.feature!;
    let newSourceData: Partial<ISourceData> = {};
    if (this.drawLine) {
      const drawLine = this.drawLine;
      drawLine.geometry.coordinates.push(feature.geometry.coordinates);
      drawLine.properties.nodes.push(feature);
      newSourceData = {
        line: this.getLineData().map(feature => {
          if (isSameFeature(feature, drawLine)) {
            return drawLine;
          }
          return feature;
        }),
        dashLine: [],
      };
    } else {
      const newLine = lineString(coordAll(feature), {
        id: getUuid('line'),
        nodes: [feature],
        isHover: false,
        isActive: true,
        isDrag: false,
        isDraw: true,
      }) as ILineFeature;

      newSourceData = {
        point: newLine.properties.nodes,
        line: [
          ...this.getLineData().map(feature => {
            feature.properties.isActive = false;
            return feature;
          }),
          newLine,
        ],
        dashLine: [],
      };
    }
    this.source.setData(newSourceData, true);
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    if (this.drawLine) {
      const isLastPoint = isSameFeature(
        e.feature,
        last(this.drawLine.properties.nodes),
      );
      if (isLastPoint) {
        this.drawFinish();
      } else {
        this.onPointCreate(e);
      }
    }
  }

  drawFinish() {
    const drawLine = this.drawLine;
    if (drawLine) {
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      this.setEditLine(isActive ? drawLine : null);
    }
  }

  setEditLine(editLine: ILineFeature | null) {
    if (editLine) {
      this.printEditLineData(editLine);
      this.pointRender?.enableEdit();
      this.pointRender?.enableEdit();
    } else {
      this.source.setData({
        point: [],
        line: this.getLineData().map(feature => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: false,
            isDrag: false,
            isHover: false,
          };
          return feature;
        }),
        dashLine: [],
        midPoint: [],
      });
      this.pointRender?.disableHover();
      this.pointRender?.disableEdit();
    }
  }

  printEditLineData(editLine: ILineFeature) {
    this.source.setData({
      point: editLine.properties.nodes.map(feature => {
        feature.properties = {
          ...feature.properties,
          isHover: false,
          isActive: false,
        };
        return feature;
      }),
      line: this.getLineData().map(feature => {
        const isActive = isSameFeature(feature, editLine);
        feature.properties = {
          ...feature.properties,
          isDraw: false,
          isActive,
          isHover: false,
        };
        return feature;
      }),
      dashLine: [],
      midPoint: calcMidPointList(editLine),
    });
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    if (this.drawLine?.properties.nodes.length) {
      const lastNode = last(this.drawLine.properties.nodes)!;
      const { lng, lat } = e.lnglat;
      const newDashLine = lineString([
        ...coordAll(lastNode),
        [lng, lat],
      ]) as IDashLineFeature;
      this.setDashLineData([newDashLine]);
    }
  }

  onPointDragging(e: ISceneMouseEvent) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    super.onPointDragging(e);
    editLine.properties.nodes = this.getPointData();
    editLine.geometry.coordinates = coordAll(
      featureCollection(editLine.properties.nodes),
    );
    this.source.setData({
      line: this.getLineData().map(feature => {
        if (isSameFeature(feature, editLine)) {
          return editLine;
        }
        return feature;
      }),
      midPoint: calcMidPointList(editLine),
    });
  }

  onMidPointMouseMove(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor('pointHover');
  }

  onMidPointMouseOut(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor(null);
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    const feature = e.feature!;
    const editLine = this.editLine!;
    const nodes = editLine.properties.nodes;
    const { startId, endId } = feature.properties;
    const startIndex = nodes.findIndex(
      feature => feature.properties.id === startId,
    );
    const endIndex = nodes.findIndex(
      feature => feature.properties.id === endId,
    );
    if (startIndex > -1 && endIndex > -1) {
      const newNode = point(feature.geometry.coordinates, {
        id: getUuid('point'),
        isHover: false,
        isActive: false,
        isDrag: false,
      }) as IPointFeature;
      nodes.splice(endIndex, 0, newNode);
      editLine.geometry.coordinates = coordAll(featureCollection(nodes));
      this.printEditLineData(editLine);
    }
  }

  disable() {
    super.disable();

    // const unNormalLineData = this.getLineData().filter(feature => {
    //   const { isActive, isDrag, isDraw, isHover } = feature.properties;
    //   return isActive || isDraw || isDrag || isHover;
    // });
    //
    // if (unNormalLineData.length) {
    //   unNormalLineData.forEach(feature => {
    //     // if (feature)
    //   })
    // }
  }

  bindEvent() {
    this.pointRender?.enableCreate();
    this.pointRender?.enableClick();
    this.midPointRender?.enableClick();
    this.midPointRender?.enableHover();
    this.scene?.on('mousemove', this.onSceneMouseMove);
  }

  unbindEvent() {
    this.pointRender?.disableCreate();
    this.pointRender?.disableClick();
    this.midPointRender?.disableClick();
    this.midPointRender?.disableHover();
    this.scene?.off('mousemove', this.onSceneMouseMove);
  }

  bindThis() {
    super.bindThis();
    this.onPointCreate = this.onPointCreate.bind(this);
    this.onPointDragging = this.onPointDragging.bind(this);
    this.onSceneMouseMove = debounceMoveFn(this.onSceneMouseMove).bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onMidPointMouseMove = this.onMidPointMouseMove.bind(this);
    this.onMidPointMouseOut = this.onMidPointMouseOut.bind(this);
  }
}
