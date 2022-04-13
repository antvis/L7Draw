import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { PointDrawer, DrawerEvent } from '@antv/l7-draw';
import { pointList } from './mock';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map7',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
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

      drawer.on(DrawerEvent.add, e => {
        console.log(e);
      });
    });
  }, []);

  return (
    <div>
      <div id="map7" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
