const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.browser.ts',
  target: 'web',
  externals: {
    // Exclude Emscripten modules from webpack processing
    // They should be loaded dynamically at runtime
    './sig/dilithium/dist/dilithium_wrapper.js': 'commonjs ./sig/dilithium/dist/dilithium_wrapper.js',
    './sig/falcon/dist/falcon_wrapper.js': 'commonjs ./sig/falcon/dist/falcon_wrapper.js',
    './sig/sphincs/dist/sphincs_wrapper.js': 'commonjs ./sig/sphincs/dist/sphincs_wrapper.js',
    './kem/mlkem/dist/mlkem_wrapper.js': 'commonjs ./kem/mlkem/dist/mlkem_wrapper.js',
    './kem/frodokem/dist/frodokem_wrapper.js': 'commonjs ./kem/frodokem/dist/frodokem_wrapper.js',
    './kem/classic_mceliece/dist/classic_mceliece_wrapper.js': 'commonjs ./kem/classic_mceliece/dist/classic_mceliece_wrapper.js',
    './kem/classic_mceliece/dist/classic_mceliece_wrapper_small.js': 'commonjs ./kem/classic_mceliece/dist/classic_mceliece_wrapper_small.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.webpack.json'
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      sig: path.resolve(__dirname, 'sig'),
      kem: path.resolve(__dirname, 'kem'),
    },
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