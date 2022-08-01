import { PointLayer, Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import { polygonList } from './mock';
import { Feature, featureCollection } from '@turf/turf';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<DrawPolygon | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const targetPoint: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [120.0421142578125, 30.280860989455412],
        },
      };
      const drawer = new DrawPolygon(scene, {
        adsorbOptions: {
          data: [targetPoint],
        },
      });
      setPolygonDrawer(drawer);
      drawer.enable();

      const pointLayer = new PointLayer()
        .source(featureCollection([targetPoint]))
        .shape('circle')
        .size(8)
        .color('red')
        .style({
          opacity: 0.5,
        });

      scene.addLayer(pointLayer);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
