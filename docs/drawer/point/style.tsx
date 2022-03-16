import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { Button } from 'antd';
import { IPointStyleItem, PointDrawer } from '@antv/l7-draw';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map1',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 2,
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
          },
        },
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
