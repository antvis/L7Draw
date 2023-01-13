import { Scene } from '@antv/l7';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

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
      const drawer = new DrawLine(scene, {});
      setLineDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button onClick={() => lineDrawer?.enable()}>启用</Button>
        <Button onClick={() => lineDrawer?.disable()}>禁用</Button>
        <Button onClick={() => lineDrawer?.clear()}>清空</Button>
      </div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
