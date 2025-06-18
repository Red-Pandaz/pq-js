const path = require('path');

module.exports = {
  entry: './index.ts',
  target: 'web',
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
  },
  output: {
    filename: 'index.browser.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'PQJS',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  externals: {
    // Exclude Node.js specific modules
    fs: 'commonjs fs',
    path: 'commonjs path',
    crypto: 'commonjs crypto',
  },
}; 