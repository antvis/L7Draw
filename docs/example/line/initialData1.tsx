import { Scene } from '@antv/l7';
import { DrawEvent, DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';
import { multiLineList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<DrawLine | null>(null);

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
        initialData: multiLineList,
      });
      setLineDrawer(drawer);
      drawer.enable();

      drawer.on(DrawEvent.Change, console.log);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
