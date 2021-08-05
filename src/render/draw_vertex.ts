import { FeatureCollection } from '@turf/helpers';
import BaseRender from './base_render';
import { renderFeature } from './renderFeature';
// 绘制过程中的顶点，绘制第一个和最后一个点
export default class DrawVertexLayer extends BaseRender {
  public styleVariant = 'active';

  public enableSelect() {
    return;
  }
  public disableSelect() {
    return;
  }

  public enableEdit() {
    if (this.isEnableEdit) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.on('mouseenter', this.onMouseEnter);
    layer.on('mouseout', this.onMouseOut);
    layer.on('click', this.onClick);
    this.isEnableEdit = true;
  }

  public disableEdit() {
    if (!this.isEnableEdit) {
      return;
    }
    const layer = this.drawLayers[0];
    layer.off('mouseenter', this.onMouseEnter);
    layer.off('mouseout', this.onMouseOut);
    layer.off('click', this.onClick);
    this.isEnableEdit = false;
  }

  private onMouseEnter = (e: any) => {
    this.draw.setCursor('move');
    this.draw.setCurrentVertex(e.feature);
    this.draw.editMode.enable();
  };
  private onMouseOut = (e: any) => {
    this.draw.resetCursor();
    this.draw.editMode.disable();
  };
  private onClick = (e: any) => {
    this.draw.setCurrentVertex(e.feature);
    this.draw.editMode.enable();
  };
}
