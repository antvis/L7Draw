import { Scene } from '@antv/l7';
import { DrawCircle } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import { Button } from 'antd';
import 'antd/dist/antd.css';
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
        initData: circleList,
        disableEditable: true,
      });
      setCircleDrawer(drawer);
    });
  }, []);

  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button onClick={() => circleDrawer?.enable()}>启用</Button>
        <Button onClick={() => circleDrawer?.disable()}>禁用</Button>
        <Button onClick={() => circleDrawer?.clear()}>清空</Button>
      </div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
