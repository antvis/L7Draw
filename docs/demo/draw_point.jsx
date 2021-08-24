import React, { useState, useEffect } from 'react';
import { Scene } from '@antv/l7';
import { DrawPolygon, DrawPoint } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Button } from 'antd';

export default () => {
  const [drawPoint, setDrawPoint] = useState(null);

  useEffect(() => {
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
      const draw = new DrawPoint(scene);

      draw.on('draw.create', e => {
        if (draw.getData().features.length < 2) {
          draw.drawLayer.onUnClick();
          setTimeout(() => {
            draw.enable();
          }, 200);
        }
      });
      draw.on('draw.update', e => {
        console.log('update', e);
      });

      setDrawPoint(draw);
    });
  }, []);

  return (
    <div>
      <Button onClick={() => drawPoint?.enable()}>开始绘制</Button>
      <div
        style={{
          height: '400px',
          position: 'relative',
        }}
        id="map"
      ></div>
    </div>
  );
};
