import React, { useEffect, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { DrawerEvent, PointDrawer } from '@antv/l7-draw';
import 'tippy.js/themes/light.css';

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
      const drawer = new PointDrawer(scene, {
        popup: {
          theme: 'light',
          // tippy 的其他Props可以放在这里，具体配置可参考 https://atomiks.github.io/tippyjs/v6/all-props/
        },

        // helper可以传部分或者不传
        helper: {
          // draw: '提示1',
          // pointHover: '提示2',
          // pointDrag: '提示3',
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
