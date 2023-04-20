import { Scene } from '@antv/l7';
import { DrawPolygon, getSingleColorStyle } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

const id = String(Math.random());

const Demo: React.FC = () => {
  useEffect(() => {
    const newScene = new Scene({
      id,
      map: new GaodeMap({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    newScene.on('loaded', () => {
      const draw = new DrawPolygon(newScene, {
        style: getSingleColorStyle('#ff0000'),
        initialData: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [120.107524, 30.257503],
                  [120.153369, 30.255792],
                  [120.162425, 30.237213],
                  [120.112335, 30.228655],
                  [120.107524, 30.257503],
                ],
              ],
            },
          },
        ],
      });
      draw.enable();
    });
  }, []);

  return <div id={id} style={{ height: 400, position: 'relative' }} />;
};

export default Demo;
