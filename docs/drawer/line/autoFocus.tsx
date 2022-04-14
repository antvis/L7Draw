import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { LineDrawer } from '@antv/l7-draw';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<LineDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map1',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new LineDrawer(scene, {
        autoFocus: false,
        editable: false,
      });
      setPointDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div id="map1" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
