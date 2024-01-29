import { Scene } from '@antv/l7';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [rectDrawer, setRectDrawer] = useState<DrawLine | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMap({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new DrawLine(scene, {
        trigger: 'drag',
        dragOptions: {
          dotDuration: 100,
          dotDistance: 30,
        },
      });
      setRectDrawer(drawer);
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
