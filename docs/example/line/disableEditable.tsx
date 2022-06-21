import { Scene } from '@antv/l7';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import { lineList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<DrawLine | null>(null);

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
      const drawer = new DrawLine(scene, {
        initData: lineList,
        disableEditable: true,
      });
      setLineDrawer(drawer);
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
