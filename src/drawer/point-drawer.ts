import { Scene } from '@antv/l7';
import { Feature, Point } from '@turf/turf';
import { DEFAULT_POINT_STYLE, DrawEvent } from '../constant';
import { PointMode } from '../mode';
import {
  DeepPartial,
  IBaseModeOptions,
  ILayerMouseEvent,
  IPointFeature,
  IPointHelperOptions,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { getDefaultPointProperties, isSameFeature } from '../utils';
import { DEFAULT_POINT_HELPER_CONFIG } from '../constant/helper';

export interface IPointDrawerOptions extends IBaseModeOptions<Feature<Point>> {
  helper: IPointHelperOptions;
}

export class PointDrawer extends PointMode<IPointDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPointDrawerOptions>) {
    super(scene, options);

    this.bindPointRenderEvent();
  }

  protected get dragItem() {
    return this.dragPoint;
  }

  protected get editItem() {
    return this.editPoint;
  }

  // @ts-ignore
  getDefaultOptions(options: DeepPartial<IPointDrawerOptions>) {
    const defaultOptions = {
      ...this.getCommonOptions(options),
      helper: DEFAULT_POINT_HELPER_CONFIG,
    };
    defaultOptions.style.point = DEFAULT_POINT_STYLE;
    return defaultOptions;
  }

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enablePointRenderAction();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disablePointRenderAction();
  }

  getRenderTypes(): IRenderType[] {
    return ['point'];
  }

  setHelper(type: keyof IPointHelperOptions | null) {
    this.popup?.setContent(type ? this.options.helper[type] : null);
  }

  setData(points: Feature<Point>[]) {
    this.setPointData(
      points.map((point) => {
        point.properties = {
          ...getDefaultPointProperties(),
          ...(point.properties ?? {}),
        };
        return point as IPointFeature;
      }),
    );
  }

  getData() {
    return this.getPointData();
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>): IPointFeature | undefined {
    if (!this.addable) {
      this.setPointData((features) => {
        return features.map((feature) => {
          feature.properties = {
            ...feature.properties,
            isHover: false,
            isActive: false,
          };
          return feature;
        });
      });
      return;
    }
    const newFeature = super.onPointCreate(e);
    if (!newFeature) {
      return;
    }
    if (this.options.editable) {
      this.setHelper('pointHover');
    }
    this.emit(DrawEvent.Add, newFeature, this.getData());
    return newFeature;
  }

  onPointMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    const feature = super.onPointMouseMove(e);
    if (this.options.editable && !this.dragPoint) {
      this.setHelper('pointHover');
    }
    return feature;
  }

  onPointMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    const feature = super.onPointMouseOut(e);
    this.setHelper(this.addable ? 'draw' : null);

    return feature;
  }

  onPointDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const dragPoint = super.onPointDragStart(e);
    this.setHelper('pointDrag');
    this.emit(DrawEvent.DragStart, dragPoint, this.getData());
    return dragPoint;
  }

  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = super.onPointDragging(e);
    if (dragPoint && this.options.editable) {
      this.emit(DrawEvent.Dragging, dragPoint, this.getData());
    }
    return dragPoint;
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = super.onPointDragEnd(e);
    if (dragPoint && this.options.editable) {
      this.setHelper('pointHover');
      this.emit(DrawEvent.DragEnd, dragPoint, this.getData());
      this.emit(DrawEvent.Edit, dragPoint, this.getData());
    }
    return dragPoint;
  }

  bindThis() {
    super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSceneMouseMove(e: ISceneMouseEvent): void {}

  setActiveFeature(target: Feature | string | null | undefined) {
    const targetFeature = this.getTargetFeature(target);
    this.setPointData((oldData) =>
      oldData.map((feature) => {
        feature.properties.isActive = isSameFeature(targetFeature, feature);
        return feature;
      }),
    );
  }

  enable() {
    super.enable();
    if (this.addable) {
      this.setHelper('draw');
    }
  }

  disable() {
    super.disable();
    if (!this.options.disableEditable) {
      this.popup?.setContent(null);
      this.setPointData((features) => {
        return features.map((feature) => {
          feature.properties = {
            ...feature.properties,
            isDrag: false,
            isActive: false,
            isHover: false,
          };
          return feature;
        });
      });
    }
  }
}
