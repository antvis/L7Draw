import { Feature } from '@turf/turf';
import { first, last } from 'lodash';
import { DrawerEvent } from '../constant';
import {
  DeepPartial,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IPolygonProperties,
  ISceneMouseEvent,
} from '../typings';
import {
  createPointFeature,
  createPolygonFeature,
  getLngLat,
  getPosition,
  isSameFeature,
  updateTargetFeature,
} from '../utils';
import { IPolygonModeOptions, PolygonMode } from './polygon-mode';

export interface IDragPolygonModeOptions<F extends Feature = Feature>
  extends IPolygonModeOptions<F> {
  createByClick: boolean;
  createByDrag: boolean;
}

export abstract class DragPolygonMode<
  T extends IPolygonModeOptions,
> extends PolygonMode<T> {
  get drawLine() {
    return this.drawPolygon?.properties.line;
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    return {
      ...super.getDefaultOptions(options),
      showMidPoint: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMidPointsByLine(line: ILineFeature): IMidPointFeature[] {
    return [];
  }

  abstract handleCreatePolygonLine(
    startNode: IPointFeature,
    endNode: IPointFeature,
    properties: Partial<ILineProperties>,
  ): ILineFeature;

  handleCreatePolygon(
    points: IPointFeature[],
    line: ILineFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    const lineNodes = line.properties.nodes;
    return createPolygonFeature(lineNodes.slice(0, lineNodes.length - 1), {
      nodes: points,
      line,
      ...properties,
    });
  }

  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (
      (!this.options.multiple &&
        this.getPolygonData().length >= 1 &&
        !this.drawPolygon) ||
      this.dragPoint ||
      this.editLine
    ) {
      return;
    }
    const { autoFocus, editable } = this.options;
    const drawPolygon = this.drawPolygon;
    const position = getPosition(e);
    const feature = this.handleCreatePoint(position);
    if (drawPolygon) {
      setTimeout(() => {
        this.setLineData((features) => [
          ...features,
          drawPolygon.properties.line,
        ]);
        this.setEditPolygon(drawPolygon);
        if (!(autoFocus && editable)) {
          this.handlePolygonUnClick(drawPolygon);
        }
        this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
      }, 0);
    } else {
      const endNode = createPointFeature(position);
      const line = this.handleCreatePolygonLine(feature, endNode, {
        isDraw: true,
        isActive: true,
      });
      const polygon = this.handleCreatePolygon([feature, endNode], line, {
        isDraw: true,
        isActive: true,
      });
      this.setPolygonData((features) =>
        updateTargetFeature({
          target: polygon,
          data: [...features, polygon],
          targetHandler: (feature) => {
            feature.properties = {
              ...feature.properties,
              isDraw: true,
              isActive: true,
            };
          },
          otherHandler: (feature) => {
            feature.properties.isActive = false;
          },
        }),
      );
    }
    return feature;
  }

  setEditPolygon(
    polygon: IPolygonFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    this.setEditLine(polygon.properties.line, properties);
    this.setPolygonData((features) => {
      return updateTargetFeature({
        target: polygon,
        data: features,
        targetHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: true,
            isDrag: false,
            isHover: false,
            ...properties,
          };
        },
        otherHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: false,
            isDrag: false,
          };
        },
      });
    });
    this.setPointData(polygon.properties.nodes);
    this.setDashLineData([]);
    const texts = this.getAllTexts();
    this.setTextData(texts);
    return polygon;
  }

  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    if (!dragPoint) {
      return;
    }
    const feature = this.handlePointDragging(dragPoint, getLngLat(e));
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      this.syncPolygonNodes(
        editPolygon,
        editPolygon.properties.nodes.map((node) => {
          if (isSameFeature(node, feature)) {
            return feature;
          }
          return node;
        }),
      );
      this.setEditPolygon(editPolygon);
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    if (!drawPolygon) {
      return;
    }
    const { nodes } = drawPolygon.properties;
    const firstNode = first(nodes)!;
    const lastNode = last(nodes)!;
    lastNode.geometry.coordinates = getPosition(e);
    this.syncPolygonNodes(drawPolygon, [firstNode, lastNode]);
    this.setDashLineData([drawPolygon.properties.line]);
    this.setTextData(this.getAllTexts());
    this.resetCursor();
  }
}
