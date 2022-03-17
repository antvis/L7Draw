import React from 'react';
import { Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        pitch: 0,
        style: 'light',
        center: [116.30470275878906, 39.88352811449648],
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const draw = new DrawPolygon(scene, {
        showDistance: true,
        showArea: true,
        dragEnable: false,  // 控制Polygon是否可以拖拽
      });
      draw.enable();

      draw.on('draw.create', (e) => {
        console.log(e);
      });
      draw.on('draw.update', (e) => {
        console.log('update', e);
      });
    });
  }, []);

  return (
    <div
      style={{
        height: '400px',
        position: 'relative',
      }}
      id="map"
    ></div>
  );
};
