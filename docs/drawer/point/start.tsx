import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { PointDrawer } from '@antv/l7-draw';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 2,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new PointDrawer(scene, {});
      setPointDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div>
        <Button onClick={() => pointDrawer?.enable()}>启用</Button>
        <Button onClick={() => pointDrawer?.disable()}>禁用</Button>
      </div>
      <div id="map" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
