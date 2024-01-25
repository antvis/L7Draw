import { Scene } from '@antv/l7';
import { DrawEvent, DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Feature } from '@turf/turf';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonList, setPolygonList] = useState<Feature[]>([]);

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
      const drawer = new DrawPolygon(scene, {
        adsorbOptions: {},
      });
      drawer.enable();

      drawer.on(DrawEvent.Change, setPolygonList);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
      <div>
        {JSON.stringify(
          polygonList.map((item) => item.bbox),
          null,
          2,
        )}
      </div>
    </div>
  );
};

export default Demo;
