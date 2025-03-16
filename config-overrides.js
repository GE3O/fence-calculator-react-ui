const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "buffer": require.resolve("buffer"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "zlib": require.resolve("browserify-zlib"),
    "util": require.resolve("util"),
    "process": require.resolve("process/browser"),
  };
  
  // Add process plugin
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );
  
  return config;
};