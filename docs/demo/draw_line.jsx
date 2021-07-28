import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { Button } from 'antd';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';

export default () => {
  const [drawTool, setDrawTool] = useState(undefined);

  const clearAllData = () => {
    drawTool.resetDraw();
  };
  const revokeData = () => {
    if (drawTool.drawStatus === 'Drawing') {
      drawTool.removeLatestVertex();
    }
  };
  React.useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        pitch: 0,
        style: 'light',
        center: [116.30470275878906, 39.88352811449648],
        zoom: 20,
      }),
    });
    scene.on('loaded', () => {
      const draw = new DrawLine(scene, {
        enableCustomDraw: true,
        customDraw: async (start, end) => {
          const coord = await (
            await fetch(
              `https://restapi.amap.com/v3/direction/walking?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}&key=261fb8bfa6d9ed16ed977d7cc62596e4`,
            )
          ).json();
          if (coord.info === 'ok') {
            const stepString = coord.route.paths[0].steps
              .map(item => item.polyline)
              .join(';');

            const res = stepString.split(';').map(item => {
              const [lng, lat] = item.split(',');
              return {
                lng: lng * 1,
                lat: lat * 1,
              };
            });

            return res;
          }

          return [end];
        },
      });
      draw.enable();

      draw.on('draw.create', e => {
        console.log(e);
      });
      draw.on('draw.update', e => {
        console.log('update', e);
      });
      draw.on('draw.modechange', e => {
        console.log('draw.modechange', e);
      });
      setDrawTool(draw);
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Button type="Default" onClick={clearAllData}>
          清除
        </Button>
        <Button type="Default" onClick={revokeData}>
          撤销
        </Button>
      </div>
      <div
        style={{
          height: '400px',
          position: 'relative',
        }}
        id="map"
      ></div>
    </div>
  );
};
