import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { PointDrawer, DrawerEvent } from '@antv/l7-draw';
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
        data: {
          point: pointList,
        },
      });
      setPointDrawer(drawer);
      drawer.enable();

      drawer.on(DrawerEvent.add, (e) => {
        console.log(e);
      });
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
