import { IInteractionTarget, ILngLat, Popup, Scene } from '@antv/l7';
import {
  Feature,
  FeatureCollection,
  featureCollection,
  Units,
} from '@turf/helpers';
import RenderLayer from '@/render/draw_result';
import DrawRender from '@/render/draw';
import DrawVertexLayer from '@/render/draw_vertex';
import DrawDistanceLayer from '@/render/draw_distance';
import { DrawEvent, DrawModes } from '../util/constant';
import DrawDelete from './draw_delete';
import DrawEdit from './draw_edit';
import DrawSource from '../source';
import DrawMode, { IDrawOption } from './draw_mode';
import DrawSelected from './draw_selected';
import merge from 'lodash/merge';
import BaseRenderLayer from '@/render/base_render';
import DrawEmptyLayer from '@/render/draw_empty';
export interface IDrawFeatureOption extends IDrawOption {
  units: Units;
  steps: number;
  showFeature: boolean;
  editEnable: boolean;
  selectEnable: boolean;
  showDistance: boolean;
  cursor: string;
}
export default abstract class DrawFeature extends DrawMode {
  // 绘制完成之后显示
  public selectMode: DrawSelected;
  public editMode: DrawEdit;
  public deleteMode: DrawDelete;
  public editEnable: boolean;
  public showDistance: boolean;

  public selectEnable: boolean;

  protected normalLayer: RenderLayer;
  protected drawLayer: DrawRender;
  protected drawVertexLayer: DrawVertexLayer;
  protected drawDistanceLayer: BaseRenderLayer;

  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);

    this.selectEnable = this.getOption('selectEnable');
    this.editEnable = this.getOption('editEnable');
    this.showDistance = this.getOption('showDistance');

    // 绘制图层
    this.drawLayer = new DrawRender(this);

    // 顶点图层
    this.drawVertexLayer = new DrawVertexLayer(this);

    // 距离指示图层
    if (this.showDistance) this.drawDistanceLayer = new DrawDistanceLayer(this);
    else this.drawDistanceLayer = new DrawEmptyLayer(this);

    // 显示态图层
    this.normalLayer = new RenderLayer(this);

    // this.editLayer = new EditLayer(this);
    this.selectMode = new DrawSelected(this.scene, {});
    this.editMode = new DrawEdit(this.scene, {});
    this.deleteMode = new DrawDelete(this.scene, {});

    this.selectMode.on(DrawEvent.UPDATE, this.onDrawUpdate);
    this.selectMode.on(DrawEvent.Move, this.onDrawMove);
    this.editMode.on(DrawEvent.MODE_CHANGE, this.onModeChange);
    this.editMode.on(DrawEvent.UPDATE, this.onDrawUpdate);
    this.editMode.on(DrawEvent.Edit, this.onDrawEdit);
    this.selectMode.on(DrawEvent.MODE_CHANGE, this.onModeChange);

    this.deleteMode.on(DrawEvent.DELETE, this.onDrawDelete);
    this.on(DrawEvent.CREATE, this.onDrawCreate);
    this.on(DrawEvent.MODE_CHANGE, this.onModeChange);
    document.addEventListener('keydown', this.addKeyDownEvent);
    if (this.options.data && this.initData()) {
      this.normalLayer.update(this.source.data);
      this.normalLayer.enableSelect();
    }
  }
  public abstract drawFinish(): void;
  public setCurrentFeature(feature: Feature) {
    this.currentFeature = feature as Feature;
    // @ts-ignore
    this.pointFeatures = feature.properties.pointFeatures;

    this.source.setFeatureActive(feature);
  }
  public deleteCurrentFeature() {
    this.deleteMode.enable();
  }
  public disableLayer() {
    // this.emit(DrawEvent.MODE_CHANGE, DrawModes.STATIC);
    this.drawLayer.disableSelect();
  }
  public enableLayer() {
    this.drawLayer.enableSelect();
  }

  public getData(): FeatureCollection {
    return this.source.getData();
  }

  public resetData(data: FeatureCollection) {
    this.source = new DrawSource(data);
    this.options = merge(this.options, this.getDefaultOptions(), { data });
    this.initData();
    this.normalLayer.update(this.source.data);
    this.normalLayer.enableSelect();
  }

  public removeAllData(): void {
    this.source.removeAllFeatures();
    this.currentFeature = null;
    this.drawLayer.hide();
    this.drawVertexLayer.hide();
    this.normalLayer.hide();
    this.hideOtherLayer();
  }

  public clear() {
    this.drawLayer.disableSelect();
    this.drawLayer.disableEdit();
    this.drawLayer.hide();
    this.drawVertexLayer.hide();
    this.hideOtherLayer();
    this.emit(DrawEvent.MODE_CHANGE, DrawModes.STATIC);
  }
  public reset() {
    this.drawLayer.show();
    this.drawVertexLayer.show();
    this.showOtherLayer();
  }

  public addVertex(feature: Feature): void {
    throw new Error('子类未实现该方法');
  }

  public onRemove() {
    this.destroy();
    this.selectMode.destroy();
    this.editMode.destroy();
    this.source.destroy();
    this.drawLayer.destroy();
    this.drawVertexLayer.destroy();
    this.normalLayer.destroy();
    document.removeEventListener('keydown', this.addKeyDownEvent);
  }
  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      steps: 64,
      units: 'kilometers',
      cursor: 'crosshair',
      editEnable: true,
      selectEnable: true,
      showDistance: true,
      showFeature: true,
    };
  }
  protected abstract onDragStart(e: IInteractionTarget): void;

  protected abstract onDragging(e: IInteractionTarget): void;

  protected abstract onDragEnd(e: IInteractionTarget): void;

  protected abstract createFeature(e?: any): Feature;

  protected abstract moveFeature(e: ILngLat): void;

  protected abstract editFeature(e: any): void;

  protected abstract hideOtherLayer(): void;

  protected abstract removeLatestVertex(): void;

  protected abstract showOtherLayer(): void;
  protected initData(): boolean {
    return false;
  }

  private addDrawPopup(lnglat: ILngLat, dis: number) {
    const popup = new Popup({
      anchor: 'left',
      closeButton: false,
    })
      .setLnglat(lnglat)
      .setText(`半径:${dis.toFixed(2)}千米`);
    this.scene.addPopup(popup);
    this.popup = popup;
  }

  private onModeChange = (mode: DrawModes[keyof DrawModes]) => {
    this.setDrawMode(mode);
    switch (mode) {
      case DrawModes.DIRECT_SELECT: // 顶点编辑
        if (!this.editEnable) {
          return;
        }
        this.editMode.enable();
        this.editMode.setEditFeature(this.currentFeature as Feature);
        this.drawLayer.updateData(
          featureCollection([this.currentFeature as Feature]),
        );
        this.drawVertexLayer.updateData(
          featureCollection(this.currentFeature?.properties?.pointFeatures),
        );
        this.drawVertexLayer.show();
        this.drawVertexLayer.enableEdit();
        this.drawDistanceLayer.show();
        this.showOtherLayer();
        this.drawStatus = 'DrawEdit';
        break;
      case DrawModes.SIMPLE_SELECT: // 图形移动
        if (!this.selectEnable) {
          this.drawLayer.hide();
          this.drawVertexLayer.hide();
          this.hideOtherLayer();
          this.emit(DrawEvent.MODE_CHANGE, DrawModes.STATIC);
          return;
        }
        this.selectMode.setSelectedFeature(this.currentFeature as Feature);
        this.selectMode.enable();
        this.drawLayer.updateData(
          // TODO:导入数据不能正常使用
          featureCollection([this.currentFeature as Feature]),
        );
        this.drawLayer.enableSelect();
        this.drawVertexLayer.updateData(
          featureCollection(this.currentFeature?.properties?.pointFeatures),
        );
        this.drawVertexLayer.disableEdit();
        this.drawVertexLayer.show();
        this.drawDistanceLayer.show();
        this.drawLayer.show();
        this.showOtherLayer();
        this.drawStatus = 'DrawSelected';
        break;
      case DrawModes.STATIC:
        if (!this.getOption('showFeature')) {
          return;
        }
        this.source.updateFeature(this.currentFeature as Feature);
        this.selectMode.disable();
        this.editMode.disable();
        this.source.clearFeatureActive();
        this.drawVertexLayer.hide();
        this.drawDistanceLayer.hide();
        this.drawVertexLayer.disableEdit();
        this.hideOtherLayer();
        this.normalLayer.update(this.source.data);
        this.normalLayer.enableSelect();
        this.drawStatus = 'DrawFinish';
        break;
    }
  };

  private onDrawCreate = (feature: Feature) => {
    this.source.addFeature(feature);
  };

  private onDrawUpdate = (feature: Feature) => {
    this.source.updateFeature(this.currentFeature as Feature);
    this.emit(DrawEvent.UPDATE, this.currentFeature);
  };

  private onDrawMove = (delta: ILngLat) => {
    if (this.drawStatus === 'DrawSelected') {
      this.moveFeature(delta);
    }
  };

  private onDrawEdit = (endpoint: ILngLat) => {
    this.editFeature(endpoint);
  };

  private onDrawDelete = () => {
    if (this.drawStatus === 'DrawSelected') {
      this.clear();
      this.source.removeFeature(this.currentFeature as Feature);

      this.normalLayer.update(this.source.data);
      this.drawLayer.disableSelect();
      this.selectMode.disable();
      this.currentFeature = null;
      // this.drawStatus = 'DrawDelete';
    }
  };
  // 键盘事件
  private addKeyDownEvent = (event: KeyboardEvent) => {
    // tslint:disable-next-line:no-arg
    const e = event || window.event;
    if (e && e.keyCode === 8) {
      this.deleteMode.enable();
    }
    // 键盘 Z
    if (e && e.keyCode === 90 && e.ctrlKey) {
      if (this.drawStatus === 'Drawing') {
        // 撤销最新绘制的顶点
        this.removeLatestVertex();
      }
    }
  };
}
