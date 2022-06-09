import React, { useEffect, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { DrawerEvent, RectDrawer } from '@antv/l7-draw';
import { rectList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [rectDrawer, setRectDrawer] = useState<RectDrawer | null>(null);

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
      const drawer = new RectDrawer(scene, {
        initData: rectList,
      });
      setRectDrawer(drawer);
      drawer.enable();

      // setTimeout(() => {
      //   drawer.setData([
      //     rectList[2]
      //   ])
      // }, 1000)

      drawer.on(DrawerEvent.add, (e) => {});
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;