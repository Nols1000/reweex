const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'reweex': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'bundles'),
    filename: '[name].min.js',
    libraryTarget: 'umd',
    library: 'reweex',
    umdNamedDefine: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
    ]
  }
};
