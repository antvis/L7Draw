import { Scene } from '@antv/l7';
import { DrawPoint } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<DrawPoint | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        center: [120.151634, 30.244831],
        pitch: 0,
        token: '5ae4492ef912cbbc93034fea0e66ff2a',
        style: 'amap://styles/6a4114a0dc821c17bb74e4f730413e01',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new DrawPoint(scene, {});
      setPointDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button onClick={() => pointDrawer?.enable()}>启用</Button>
        <Button onClick={() => pointDrawer?.disable()}>禁用</Button>
        <Button onClick={() => pointDrawer?.clear()}>清空</Button>
      </div>
      <div id="map" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
