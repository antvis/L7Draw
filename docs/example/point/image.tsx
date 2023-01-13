import { Scene } from '@antv/l7';
import { DrawPoint } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
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
      scene.addImage(
        'dingwei',
        'https://gw.alipayobjects.com/mdn/rms_3bf4aa/afts/img/A*JL46TZ_iYB0AAAAAAAAAAAAAARQnAQ',
      );

      const drawer = new DrawPoint(scene, {
        style: {
          point: {
            normal: { shape: 'dingwei', size: 10 },
            hover: { shape: 'dingwei', size: 20, color: '#1990FF' },
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
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
