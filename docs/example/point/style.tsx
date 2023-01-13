import { ILayer, Scene } from '@antv/l7';
import { DrawPoint, IPointStyleItem } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<DrawPoint | null>(null);

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
      const overwriteStyle: Partial<IPointStyleItem> = {
        color: '#0000ff',
        size: 8,
        shape: 'square',
        stroke: '#ffff00',
      };

      const drawer = new DrawPoint(scene, {
        style: {
          point: {
            normal: overwriteStyle,
            hover: {
              ...overwriteStyle,
              size: 12,
            },
            active: {
              ...overwriteStyle,
              size: 12,
              color: '#ff0000',
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
