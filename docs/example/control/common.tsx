import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';
import { ControlEvent } from '../../../src';

const id = String(Math.random());

const Demo: React.FC = () => {
  // const [circleDrawer, setCircleDrawer] = useState<DrawCircle | null>(null);

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
      const overwriteStyle = {
        color: '#a03dff',
      };
      // 实例化 DrawControl
      const drawControl = new DrawControl(scene, {
        // 支持传入所有 Draw 的通用配置，会在各个 Draw 实例化时传入
        commonDrawOptions: {
          editable: false,
          style: {
            point: {
              normal: overwriteStyle,
              hover: overwriteStyle,
              active: overwriteStyle,
            },
            line: {
              normal: overwriteStyle,
              hover: overwriteStyle,
              active: overwriteStyle,
            },
            polygon: {
              normal: overwriteStyle,
              hover: overwriteStyle,
              active: overwriteStyle,
            },
            midPoint: {
              normal: overwriteStyle,
            },
            dashLine: {
              normal: overwriteStyle,
            },
            text: {
              normal: overwriteStyle,
              active: overwriteStyle,
            },
          },
        },
      });

      // 将 Control 添加至地图中
      scene.addControl(drawControl);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
