import { defineConfig } from 'father';

export default defineConfig({
  esm: { output: 'es' },
  cjs: { output: 'lib' },
  umd: {
    name: 'L7.Draw',
    output: 'dist',
    extractCSS: true,
    externals: {
      'lodash-es': '_',
      '@antv/l7': 'L7',
      '@turf/turf': 'turf',
    },
    chainWebpack(memo) {
      memo
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
          { analyzerMode: 'static', openAnalyzer: false },
        ]);
      return memo;
    },
  },
});
