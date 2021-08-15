import React from 'react';
import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';

export default () => {
  React.useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        pitch: 0,
        style: 'light',
        center: [116.30470275878906, 39.88352811449648],
        zoom: 12,
      }),
    });
    scene.on('loaded', () => {
      const drawControl = new DrawControl(scene, {
        position: 'topright',
        layout: 'horizontal', // horizontal vertical
        controls: {
          point: {
            selectEnable: false,
            showFeature: false,
          },
          line: {
            selectEnable: true,
            showFeature: true,
          },
          polygon: {
            selectEnable: true,
            showFeature: true,
          },
          circle: {
            selectEnable: true,
            showFeature: true,
            showDistance: true,
          },
          rect: false,
          delete: false,
        },
      });
      scene.on('click', () => {});
      drawControl.on('draw.create', e => {
        console.log('create', e);
      });
      drawControl.on('draw.delete', e => {
        console.log('delete', e);
      });
      scene.addControl(drawControl);
    });
  }, []);

  return (
    <div
      style={{
        height: '800px',
        position: 'relative',
      }}
      id="map"
    ></div>
  );
};
