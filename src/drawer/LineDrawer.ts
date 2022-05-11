import {
  BaseLineDrawer,
  IBaseLineDrawerOptions,
} from './common/BaseLineDrawer';
import { DrawerEvent } from '../constants';
import {
  IDrawerOptionsData,
  ILayerMouseEvent,
  ILineFeature,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import { transformLineFeature } from '../utils';

export interface ILineDrawerOptions extends IBaseLineDrawerOptions {}

export class LineDrawer extends BaseLineDrawer<ILineDrawerOptions> {
  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.line?.length) {
      const sourceData: Partial<ISourceData> = {};
      const line = data.line.map((feature) => transformLineFeature(feature));
      const editLine = line.find((feature) => feature.properties.isActive);
      sourceData.line = line;
      setTimeout(() => {
        if (editLine && this.options.editable && this.isEnable) {
          this.setEditLine(editLine);
        }
      }, 0);
      return sourceData;
    }
  }

  clear(disable: boolean = false) {
    super.clear(disable);
    this.emit(DrawerEvent.change, this.getLineData());
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    super.onPointDragEnd(e);
    if (!dragPoint || !this.options.editable) {
      return;
    }
    this.emit(DrawerEvent.edit, this.editLine, this.getLineData());
    this.emit(DrawerEvent.change, this.getLineData());
  }

  onLineMouseDown(e: ILayerMouseEvent<ILineFeature>) {
    const currentLine = e.feature;
    super.onLineMouseDown(e);
    if (!currentLine || !this.options.editable || this.drawLine) {
      return;
    }
    this.emit(DrawerEvent.dragStart, currentLine, this.getLineData());
  }

  onLineDragging(e: ILayerMouseEvent<ILineFeature>) {
    const dragLine = this.dragLine;
    super.onLineDragging(e);
    if (!dragLine || !this.options.editable || this.dragPoint) {
      return;
    }
    this.emit(DrawerEvent.dragging, dragLine, this.getLineData());
  }

  onLineDragEnd(e: ILayerMouseEvent<ILineFeature>) {
    const dragLine = this.dragLine;
    super.onLineDragEnd(e);
    if (!dragLine || !this.options.editable || this.dragPoint) {
      return;
    }
    this.emit(DrawerEvent.dragEnd, dragLine, this.getLineData());
    this.emit(DrawerEvent.edit, dragLine, this.getLineData());
    this.emit(DrawerEvent.change, this.getLineData());
  }

  drawLineFinish() {
    const drawLine = this.drawLine;
    super.drawLineFinish();
    if (drawLine) {
      this.emit(DrawerEvent.add, drawLine, this.getLineData());
      this.emit(DrawerEvent.change, this.getLineData());
    }
  }

  bindThis() {
    super.bindThis();

    this.drawLineFinish = this.drawLineFinish.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
    this.onLineMouseDown = this.onLineMouseDown.bind(this);
    this.onLineDragging = this.onLineDragging.bind(this);
    this.onLineDragEnd = this.onLineDragEnd.bind(this);
  }
}
