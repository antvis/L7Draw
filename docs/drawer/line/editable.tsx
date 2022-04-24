import React, {useEffect, useState} from 'react';
import {Scene} from '@antv/l7';
import {GaodeMap} from '@antv/l7-maps';
import {LineDrawer} from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<LineDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMap({
        center: [120.13858795166014, 30.247204606534158],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new LineDrawer(scene, {
        editable: false, // 禁用编辑
        autoFocus: false, // 新增后是否自动选中
      });
      setLineDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
