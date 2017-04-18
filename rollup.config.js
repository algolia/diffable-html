import buble from 'rollup-plugin-buble';

export default {
  entry: 'index.js',
  dest: 'dist/diffable-html.js',
  plugins: [buble()],
  format: 'cjs',
  external: ['htmlparser2']
};
