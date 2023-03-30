import { Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { polygonList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<DrawPolygon | null>(null);

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

    const polygon = cloneDeep(polygonList);

    if (polygon[0].properties) {
      polygon[0].properties.isActive = true;
    }

    scene.on('loaded', () => {
      const drawer = new DrawPolygon(scene, {
        showMidPoint: false,
        initialData: polygon,
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
