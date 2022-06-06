import { defineConfig } from 'dumi';

const prefixPath = 'l7-draw-2.0-site';

export default defineConfig({
  title: 'L7Draw',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  mode: 'site',
  extraBabelIncludes: ['@antv/dumi-theme-antv'],
  navs: [
    {
      title: '快速开始',
      path: '/start',
    },
    {
      title: '文档',
      path: '/docs',
    },
    {
      title: '示例',
      path: '/example',
    },
    {
      title: '周边生态',
      children: [
        {
          title: 'L7',
          path: 'https://l7.antv.vision',
        },
        {
          title: 'L7Plot',
          path: 'https://l7plot.antv.vision/',
        },
        {
          title: 'L7React',
          path: 'https://antv.vision/L7-react/',
        },
      ],
    },
    {
      title: 'Github',
      path: 'https://github.com/antvis/L7-draw',
    },
  ],
  // styles: ['https://cdn.bootcdn.net/ajax/libs/antd/4.20.2/antd.css'],
  outputPath: 'docs-dist',
  publicPath: `/${prefixPath}/`,
  base: `/${prefixPath}/`,
  devServer: {
    port: 8080,
  },
  // more config: https://d.umijs.org/config
});
