import { Scene } from '@antv/l7';
import { PolygonDrawer } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { polygonList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<PolygonDrawer | null>(
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

    const polygon = cloneDeep(polygonList);

    if (polygon[0].properties) {
      polygon[0].properties.isActive = true;
    }

    scene.on('loaded', () => {
      const drawer = new PolygonDrawer(scene, {
        showMidPoint: false,
        initData: polygon,
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
