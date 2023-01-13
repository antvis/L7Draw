import { PointLayer, Scene } from '@antv/l7';
import { DrawEvent, DrawPolygon } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { bbox, pointsWithinPolygon, randomPoint } from '@turf/turf';
import React, { useEffect, useState } from 'react';

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
    scene.on('loaded', () => {
      scene.addImage(
        'site',
        'https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*i7uyS6lLupYAAAAAAAAAAAAAARQnAQ',
      );
      const drawer = new DrawPolygon(scene, {
        editable: false,
        style: {
          polygon: {
            normal: {
              color: 'rgba(0,0,0,0)',
            },
            hover: {
              color: 'rgba(0,0,0,0)',
            },
            active: {
              color: 'rgba(0,0,0,0)',
            },
          },
        },
      });
      const layer = new PointLayer({
        blend: 'normal',
      })
        .source([])
        .shape('site')
        .size(12)
        .style({
          offsets: [0, 16],
        });
      scene.addLayer(layer);
      setPolygonDrawer(drawer);
      drawer.enable();
      (scene.map as any).addLayer(new window.AMap.TileLayer.Satellite());

      drawer.on(DrawEvent.Add, (newPolygon) => {
        const box = bbox(newPolygon);
        const data = pointsWithinPolygon(
          randomPoint(80, {
            bbox: box,
          }),
          newPolygon,
        );
        layer.setData(data);
      });
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 600, position: 'relative' }} />
    </div>
  );
};

export default Demo;
