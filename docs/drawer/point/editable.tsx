import React, { useEffect, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { PointDrawer } from '@antv/l7-draw';
import { pointList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMap({
        center: [120.13858795166014, 30.247204606534158],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new PointDrawer(scene, {
        editable: false, // 禁用编辑
        initData: {
          point: pointList,
        },
      });
      setPointDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
