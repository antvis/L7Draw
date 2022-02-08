import React from 'react';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { useEffect } from 'react';
import { PointDrawer } from '../src';

const Demo: React.FC = () => {
  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        center: [105.732421875, 32.24997445586331],
        pitch: 0,
        style: 'dark',
        zoom: 2,
      }),
    });
    scene.on('loaded', () => {
      const pointDrawer = new PointDrawer(scene);
      pointDrawer.enable();
    });
  }, []);

  return <div id="map" style={{ height: 400, position: 'relative' }} />;
};

export default Demo;
