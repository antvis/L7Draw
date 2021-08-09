import { bindAll, IInteractionTarget, ILayer, Scene } from '@antv/l7';
const InitFeature = {
  type: 'FeatureCollection',
  features: [],
};
import { Feature, FeatureCollection } from '@turf/helpers';
import Draw from '../modes/draw_feature';
import { DrawEvent, DrawModes } from '../util/constant';
import BaseRender from './base_render';
import RenderFeature from './renderFeature';

const rf = RenderFeature.defaultRenderer();

/**
 * 绘制图层
 */
export default class DrawLayer extends BaseRender {
  public styleVariant = 'active';

  constructor(draw: Draw) {
    super(draw);
    bindAll(['onMouseMove', 'onUnMouseMove', 'onClick', 'onUnClick'], this);
  }

  public update(feature: FeatureCollection) {
    this.removeLayers();
    const style = this.draw.getStyle(this.styleVariant);
    this.drawLayers = rf.renderFeature(feature, style);
    this.addLayers();
  }
  public enableSelect() {
    this.show();
    if (this.isEnableDrag) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.on('mouseenter', this.onMouseMove);
    layer.on('mouseout', this.onUnMouseMove);
    if (this.draw.editEnable) {
      layer.on('click', this.onClick);
    }
    layer.on('unclick', this.onUnClick);
    this.isEnableDrag = true;
  }
  public disableSelect() {
    if (!this.isEnableDrag) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.off('mouseenter', this.onMouseMove);
    layer.off('mouseout', this.onUnMouseMove);
    layer.off('click', this.onClick);
    layer.off('unclick', this.onUnClick);
    this.isEnableDrag = false;
  }

  public enableEdit() {
    if (this.isEnableEdit) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.on('unclick', this.onUnClick);
    this.isEnableDrag = true;
  }

  public disableEdit() {
    if (!this.isEnableEdit) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.off('unclick', this.onUnClick);
    this.isEnableDrag = false;
  }

  protected onMouseMove(e: any) {
    this.draw.setCursor('move');
    this.draw.selectMode.enable();
    this.draw.measureMode.enable();
  }
  protected onUnMouseMove(e: any) {
    this.draw.resetCursor();
    this.draw.selectMode.disable();
  }
  protected onClick(e: any) {
    this.draw.selectMode.disable();
    this.draw.editMode.enable();
    this.disableSelect();
    this.draw.resetCursor();
    this.enableEdit();
    this.draw.setCurrentFeature(e.feature);
    this.draw.emit(DrawEvent.MODE_CHANGE, DrawModes.DIRECT_SELECT);
  }

  protected onUnClick(e: any) {
    this.draw.selectMode.disable();
    this.draw.editMode.disable();
    this.draw.source.setFeatureUnActive(
      this.draw.getCurrentFeature() as Feature,
    );
    this.disableSelect();
    this.disableEdit();
    this.hide();
    this.draw.emit(DrawEvent.MODE_CHANGE, DrawModes.STATIC);
  }
}
