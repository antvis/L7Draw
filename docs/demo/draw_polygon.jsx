import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Button } from 'antd';

export default () => {
  const [drawPolygon, setDrawPolygon] = useState(null);

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
        showArea: false,
      });
      draw.enable();

      draw.on('draw.create', e => {
        console.log(e);
      });
      draw.on('draw.update', e => {
        console.log('update', e);
      });

      setDrawPolygon(draw);
    });
  }, []);

  return (
    <div>
      <Button onClick={() => drawPolygon.enable()}>开始绘制</Button>
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
