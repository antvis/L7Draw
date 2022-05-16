import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { useEffect } from 'react';
import 'antd/dist/antd.css';
import { RectDrawer } from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [rectDrawer, setRectDrawer] = useState<RectDrawer | null>(null);

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
      const transparentColor = 'rbga(0,0,0,0)';
      const mainColor = '#9154DE';

      const drawer = new RectDrawer(scene, {
        style: {
          point: {
            normal: {
              color: mainColor,
            },
            hover: {
              color: mainColor,
            },
            active: {
              color: mainColor,
            },
          },
          line: {
            normal: {
              color: '#541DAB',
            },
            hover: {
              color: mainColor,
            },
            active: {
              color: mainColor,
            },
          },
          polygon: {
            normal: {
              color: transparentColor,
            },
            hover: {
              color: transparentColor,
            },
            active: {
              color: transparentColor,
            },
          },
          dashLine: {
            normal: {
              color: mainColor,
            },
          },
        },
      });
      setRectDrawer(drawer);
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
