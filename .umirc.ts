import { defineConfig } from 'dumi';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  title: 'L7Draw',
  favicon:
    'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*7svFR6wkPMoAAAAAAAAAAAAADmJ7AQ/original',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  mode: 'site',
  extraBabelIncludes: ['@antv/dumi-theme-antv'],
  navs: [
    {
      title: '文档',
      path: '/docs',
    },
    {
      title: '示例',
      path: '/example',
    },
    {
      title: '工具',
      path: 'https://l7editor.antv.antgroup.com',
    },
    {
      title: '周边生态',
      children: [
        {
          title: 'L7',
          path: 'https://l7.antv.antgroup.com/',
        },
        {
          title: 'L7Plot',
          path: 'https://l7plot.antv.antgroup.com/',
        },
        {
          title: 'LarkMap',
          path: 'https://larkmap.antv.antgroup.com/',
        },
        {
          title: 'Location Insight',
          path: 'https://locationinsight.antv.antgroup.com/',
        },
        {
          title: 'L7Editor',
          path: 'https://li.antv.antgroup.com/#/home',
        },
      ],
    },
    {
      title: '历史版本',
      children: [
        {
          title: '2.x',
          path: 'https://antv.vision/l7draw-2.x-site/',
        },
      ],
    },
    {
      title: 'Github',
      path: 'https://github.com/antvis/L7Draw',
    },
    // {
    //   title: '更新日志',
    //   path: 'https://github.com/antvis/L7Draw/tree/feat/refactor',
    // },
  ],
  // styles: ['https://cdn.bootcdn.net/ajax/libs/antd/4.20.2/antd.css'],
  outputPath: 'docs-dist',
  devServer: {
    port: 8080,
  },
  copy: isProduction ? ['docs/CNAME'] : [],
  devtool: isProduction ? false : 'eval',
  scripts: [
    ` window._AMapSecurityConfig = {
      securityJsCode: "290ddc4b0d33be7bc9b354bc6a4ca614"
    }`,
    'https://webapi.amap.com/maps?v=2.0&key=6f025e700cbacbb0bb866712d20bb35c',
  ],
  // more config: https://d.umijs.org/config
});
