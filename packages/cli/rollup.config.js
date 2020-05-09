const {preserveShebangs} = require('rollup-plugin-preserve-shebangs');
module.exports = {
  input: './src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [preserveShebangs()]
};