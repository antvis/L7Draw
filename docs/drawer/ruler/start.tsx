import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { RulerDrawer } from '@antv/l7-draw';

const Demo: React.FC = () => {
  const [rulerDrawer, setRulerDrawer] = useState<RulerDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new RulerDrawer(scene, {});
      setRulerDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button onClick={() => rulerDrawer?.enable()}>启用</Button>
        <Button onClick={() => rulerDrawer?.disable()}>禁用</Button>
        <Button onClick={() => rulerDrawer?.clear()}>清空</Button>
      </div>
      <div id="map" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
