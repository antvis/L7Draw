import { Scene } from '@antv/l7';
import { DrawCircle, DrawEvent } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';
import { circleList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [circleDrawer, setCircleDrawer] = useState<DrawCircle | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new DrawCircle(scene, {
        initialData: circleList,
      });
      setCircleDrawer(drawer);
      drawer.enable();

      // setTimeout(() => {
      //   drawer.setData([
      //     rectList[2]
      //   ])
      // }, 1000)

      drawer.on(DrawEvent.add, (e) => {});
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
