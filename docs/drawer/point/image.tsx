import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { useEffect } from 'react';
import { IPointStyleItem, PointDrawer } from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

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
      scene.addImage(
        'dingwei',
        'https://gw.alipayobjects.com/mdn/rms_3bf4aa/afts/img/A*JL46TZ_iYB0AAAAAAAAAAAAAARQnAQ',
      );

      const drawer = new PointDrawer(scene, {
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
