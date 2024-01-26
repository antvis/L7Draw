import { Scene, PolygonLayer } from '@antv/l7';
import { DrawEvent, DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { Feature, bboxPolygon, featureCollection } from '@turf/turf';
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
        bbox: true,
      });
      drawer.enable();

      const polygonLayer = new PolygonLayer();

      polygonLayer
        .source(featureCollection([]))
        .shape('line')
        .size(2)
        .color('#fff')
        .style({
          opacity: 0.5,
        });

      scene.addLayer(polygonLayer);

      drawer.on(DrawEvent.Change, (newFeatures: Feature[]) => {
        setPolygonList(newFeatures);

        polygonLayer.setData(
          featureCollection(newFeatures.map((item) => bboxPolygon(item.bbox!))),
        );
      });
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
      <pre style={{ padding: 12 }}>
        {JSON.stringify(
          polygonList.map((item) => item.bbox),
          null,
          2,
        )}
      </pre>
    </div>
  );
};

export default Demo;
