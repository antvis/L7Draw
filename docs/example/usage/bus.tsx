import { ILayer, ILngLat, PointLayer, Scene } from '@antv/l7';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import { coordAll } from '@turf/turf';
import { first, last } from 'lodash';
import React, { useEffect, useState } from 'react';
import { DrawEvent } from '../../../src';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<DrawLine | null>(null);
  const [siteList, setSiteList] = useState<ILngLat[]>([]);
  const [scene, setScene] = useState<Scene | null>(null);
  const [siteLayer, setSiteLayer] = useState<ILayer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'light',
        zoom: 10,
      }),
    });

    scene.addImage(
      'arrow',
      'https://gw.alipayobjects.com/zos/bmw-prod/ce83fc30-701f-415b-9750-4b146f4b3dd6.svg',
    );

    scene.addImage(
      'site',
      'https://gw.alipayobjects.com/mdn/antv_site/afts/img/A*BJ6cTpDcuLcAAAAAAAAAAABkARQnAQ',
    );

    scene.on('loaded', () => {
      setScene(scene);
      const drawer = new DrawLine(scene, {
        autoActive: false,
        multiple: true,
        distanceText: {
          total: true,
        },
        style: {
          point: {
            normal: {
              size: 8,
            },
            active: {
              size: 10,
            },
          },
          dashLine: {
            normal: {
              size: 4,
            },
          },
          line: {
            normal: {
              size: 4,
            },
            hover: {
              size: 4,
            },
            active: {
              size: 4,
            },
            callback: (layers: ILayer[]) => {
              layers.forEach((layer) => {
                layer
                  .animate({
                    interval: 1, // 间隔
                    duration: 1, // 持续时间，延时
                    trailLength: 2, // 流线长度
                  })
                  .style({
                    lineTexture: true, // 开启线的贴图功能
                    iconStep: 40, // 设置贴图纹理的间距
                    iconStepCount: 4,
                  });
              });
            },
          },
        },
      });
      setLineDrawer(drawer);
      drawer.enable();

      drawer.on(DrawEvent.add, (newLine) => {
        const positions = coordAll(newLine);
        const firstPosition = first(positions)!;
        const lastPosition = last(positions)!;
        setSiteList([
          {
            lng: firstPosition[0],
            lat: firstPosition[1],
          },
          {
            lng: lastPosition[0],
            lat: lastPosition[1],
          },
        ]);
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
      setSiteLayer(layer);
    });
  }, []);

  useEffect(() => {
    siteLayer?.setData(siteList, {
      parser: {
        type: 'json',
        x: 'lng',
        y: 'lat',
      },
    });
  }, [siteList, siteLayer]);

  return (
    <div>
      <div id={id} style={{ height: 600, position: 'relative' }} />
    </div>
  );
};

export default Demo;
