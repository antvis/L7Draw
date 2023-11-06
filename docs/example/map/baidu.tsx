import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { BaiduMap } from '@antv/l7-maps';
import React, { useEffect } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  useEffect(() => {
    const scene = new Scene({
      id,
      map: new BaiduMap({
        center: [107.054293, 35.246265],
        zoom: 4.056,
        style: 'c17b1c2b528429a7b04bbc8d3eb8bae9',
        // 百度地图的logo是否可见，默认true
        logoVisible: false,
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
