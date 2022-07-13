import { Scene } from '@antv/l7';
import { DrawPolygon } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import { Button } from 'antd';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<DrawPolygon | null>(null);

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
      const container = document.createElement('div');
      container.innerHTML = '<div style="color: #ffff00">双击结束绘制</div>';

      // @ts-ignore
      const drawer = new DrawPolygon(scene, {
        // 绘制提示文案配置
        helper: {
          // 可以替换默认提示文案
          draw: '绘制第一个节点',
          drawContinue: '继续绘制节点',

          // 可以插入 DOM 元素
          drawFinish: container.firstElementChild ?? undefined,
        },
        // 弹框相关配置
        popup: {
          theme: 'dark',
        },

        // 关闭绘制提示
        // helper: false,
      });
      setPolygonDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div style={{ padding: 8 }}>
        <Button
          onClick={() => {
            // 支持使用 setHelper 方案替换绘制
            polygonDrawer?.setHelper('L7Draw No.1');
          }}
        >
          替换绘制文案
        </Button>
      </div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
