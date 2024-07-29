import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import nodePolyfills from 'rollup-plugin-node-polyfills';
// import analyze from 'rollup-plugin-analyzer';

export default {
  esm: 'babel',
  cjs: 'babel',
  umd: {
    name: 'L7.Draw',
    file: 'l7-draw',
    minFile: true,
    sourcemap: true,
    globals: {
      '@antv/l7': 'L7',
    },
  },
  extraRollupPlugins: [optimizeLodashImports(), nodePolyfills()], //analyze()
  lessInBabelMode: true,
};
