import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { IPointStyleItem, PointDrawer } from '@antv/l7-draw';

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id: 'map2',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      scene.addImage(
        'dingwei',
        'https://gw.alipayobjects.com/mdn/rms_3bf4aa/afts/img/A*JL46TZ_iYB0AAAAAAAAAAAAAARQnAQ',
      );

      const drawer = new PointDrawer(scene, {
        style: {
          point: {
            normal: { shape: 'dingwei', size: 10 },
            hover: { shape: 'dingwei', size: 20 },
            active: { shape: 'dingwei', size: 20 },
          },
        },
      });
      setPointDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div id="map2" style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
