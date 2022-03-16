import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
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
            normal: { shape: 'dingwei' },
            hover: { shape: 'dingwei' },
            active: { shape: 'dingwei' },
          },
        },
      });
      setPointDrawer(drawer);
      drawer.enable();

      scene.addImage(
        'dingwei',
        'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic.51yuansu.com%2Fpic3%2Fcover%2F03%2F31%2F18%2F5b80d2672779c_610.jpg&refer=http%3A%2F%2Fpic.51yuansu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1650031202&t=c4c3abb520e259ae8252bf308c7644db',
      );
    });
  }, []);

  return (
    <div>
      <div id="map1" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
