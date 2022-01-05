import React from 'react';
import { Scene, PolygonLayer } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { featureCollection } from '@turf/helpers';

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
      const polygonLayer = new PolygonLayer();
      polygonLayer.source(
        featureCollection([
          {
            type: 'Feature',
            properties: {
              id: 339,
              type: 'polygon',
              active: true,
              pointFeatures: [
                {
                  type: 'Feature',
                  properties: {
                    active: true,
                    id: '0',
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [116.356459, 39.918031],
                  },
                },
                {
                  type: 'Feature',
                  properties: {
                    active: true,
                    id: '1',
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [116.356116, 39.901309],
                  },
                },
                {
                  type: 'Feature',
                  properties: {
                    active: true,
                    id: '2',
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [116.32144, 39.90223],
                  },
                },
                {
                  type: 'Feature',
                  properties: {
                    active: true,
                    id: '3',
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [116.325903, 39.914608],
                  },
                },
              ],
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [116.356459, 39.918031],
                  [116.356116, 39.901309],
                  [116.32144, 39.90223],
                  [116.325903, 39.914608],
                  [116.356459, 39.918031],
                ],
              ],
            },
          },
        ]),
      );
      polygonLayer.shape('fill').color('red');
      polygonLayer.zIndex = 1;
      scene.addLayer(polygonLayer);

      const drawControl = new DrawControl(scene, {
        position: 'topright',
        layout: 'horizontal', // horizontal vertical
        controls: {
          point: {
            selectEnable: false,
            showFeature: false,
          },
          line: {
            selectEnable: false,
            showFeature: false,
          },
          polygon: {
            selectEnable: true,
            showFeature: true,
          },
          circle: {
            selectEnable: true,
            showFeature: true,
            showDistance: true,
            showArea: true,
          },
          rect: false,
          delete: false,
        },
        style: {
          active: {
            point: {
              color: '#1777FF',
            },
            line: {
              color: '#1777FF',
            },
            polygon: {
              color: '#1777FF',
            },
          },
          normal: {
            point: {
              color: '#1777FF',
            },
            line: {
              color: '#1777FF',
            },
            polygon: {
              color: '#1777FF',

              style: {
                color: '#1777FF',
              },
            },
          },
          mid_point: {
            point: {
              color: '#1777FF',
            },
          },
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
