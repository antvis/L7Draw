import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'l7-draw',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  styles: ['https://lib.baomitu.com/antd/4.18.6/antd.css'],
  publicPath: '/L7-draw-2/',
  base: '/L7-draw-2/',
  devServer: {
    port: 8080,
  },
  // more config: https://d.umijs.org/config
});
