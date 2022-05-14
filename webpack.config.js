const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: ['node'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      "@src": path.resolve(__dirname, 'src')
    }
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'lib'),
  },
};
