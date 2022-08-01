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
      const drawer = new DrawPolygon(scene, {
        adsorbOptions: {},
        initialData: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [120.11764526367186, 30.25521201642245],
                  [120.10391235351564, 30.21398171687066],
                  [120.16468048095703, 30.217838520965802],
                  [120.11764526367186, 30.25521201642245],
                ],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [120.11764526367186, 30.25521201642245],
                  [120.16468048095703, 30.217838520965802],
                  [120.18424987792969, 30.288717426233095],
                  [120.11764526367186, 30.25521201642245],
                ],
              ],
            },
          },
        ],
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
