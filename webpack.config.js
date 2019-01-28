const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'reweex': './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'bundles'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'reweex',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
    ]
  }
};
