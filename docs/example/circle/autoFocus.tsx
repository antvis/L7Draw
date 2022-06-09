import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { useEffect } from 'react';
import 'antd/dist/antd.css';
import { CircleDrawer } from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [circleDrawer, setCircleDrawer] = useState<CircleDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.13858795166014, 30.247204606534158],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new CircleDrawer(scene, {
        autoFocus: false,
      });
      setCircleDrawer(drawer);
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
