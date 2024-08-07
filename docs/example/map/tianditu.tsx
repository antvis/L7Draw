import { Scene, TMap } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import React, { useEffect } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  useEffect(() => {
    const scene = new Scene({
      id,
      map: new TMap({
        center: [107.054293, 35.246265],
        zoom: 4.056,
        style: 'style1',
      }),
    });
    scene.on('loaded', () => {
      const drawControl = new DrawControl(scene, {});
      // 将 Control 添加至地图中
      scene.addControl(drawControl);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
