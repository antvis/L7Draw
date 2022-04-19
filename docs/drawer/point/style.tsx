import React, { useState } from 'react';
import { ILayer, Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { IPointStyleItem, PointDrawer } from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

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
      const overwriteStyle: Partial<IPointStyleItem> = {
        color: '#ff0000',
        size: 12,
        shape: 'square',
        borderColor: '#ff00ff',
        borderWidth: 3,
      };

      const drawer = new PointDrawer(scene, {
        style: {
          point: {
            normal: overwriteStyle,
            hover: {
              ...overwriteStyle,
              size: 18,
            },
            active: {
              ...overwriteStyle,
              size: 18,
              color: '#ffff00',
            },
            callback: (layers: ILayer[]) => {
              // 对layers进行函数式设置样式
            },
          },
        },
      });
      setPointDrawer(drawer);
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
