import React, { useState } from 'react';
import { Scene } from '@antv/l7';
import { Button } from 'antd';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';

export default () => {
  const [drawTool, setDrawTool] = useState(undefined);

  const clearAllData = () => {
    console.log('清除');
    drawTool.resetDraw();
  };
  const revokeData = () => {
    console.log('drawMode', drawTool.getDrawMode());
    if (drawTool.drawStatus === 'Drawing') {
      drawTool.removeLatestVertex();
    }
    console.log(drawTool.drawStatus);
  };
  React.useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new GaodeMap({
        pitch: 0,
        style: 'light',
        center: [116.30470275878906, 39.88352811449648],
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const draw = new DrawLine(scene);
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
