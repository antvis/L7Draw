import { Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<DrawPolygon | null>(
    null,
  );

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
      const drawer = new DrawPolygon(scene, {
        distanceText: {},
        areaText: {},
      });
      setPolygonDrawer(drawer);
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
