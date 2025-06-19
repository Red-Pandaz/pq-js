const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './index.browser.ts',
  target: 'web',
  externals: {
    // Exclude Emscripten modules from webpack processing
    // They should be loaded dynamically at runtime
    './dist-browser/sig/dilithium_wrapper.js': 'commonjs ./dist-browser/sig/dilithium_wrapper.js',
    './dist-browser/sig/falcon_wrapper.js': 'commonjs ./dist-browser/sig/falcon_wrapper.js',
    './dist-browser/sig/sphincs_wrapper.js': 'commonjs ./dist-browser/sig/sphincs_wrapper.js',
    './dist-browser/kem/mlkem_wrapper.js': 'commonjs ./dist-browser/kem/mlkem_wrapper.js',
    './dist-browser/kem/frodokem_wrapper.js': 'commonjs ./dist-browser/kem/frodokem_wrapper.js',
    './dist-browser/kem/classic_mceliece_wrapper.js': 'commonjs ./dist-browser/kem/classic_mceliece_wrapper.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser"),
    },
  },
  output: {
    filename: 'index.browser.js',
    path: path.resolve(__dirname, 'dist-browser'),
    library: {
      name: 'PQJS',
      type: 'umd',
    },
    globalObject: 'this',
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};