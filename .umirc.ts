import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'L7-draw',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  mode: 'site',
  navs: [
    null, {
      title: 'Github',
      path: 'https://github.com/antvis/L7-draw'
    }
  ],
  outputPath: 'docs-dist',
  styles: ['https://lib.baomitu.com/antd/4.18.6/antd.css'],
  publicPath: '/l7-draw-2.0-site/',
  base: '/l7-draw-2.0-site/',
  devServer: {
    port: 8080,
  },
  // more config: https://d.umijs.org/config
});
