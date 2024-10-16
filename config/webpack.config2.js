import path from 'path';

module.exports = {
  
  resolve: {
    fallback: {
      "path": require.resolve('path-browserify'),
      "crypto": require.resolve('crypto-browserify'),
      "stream": require.resolve('stream-browserify'),
      "url": require.resolve('url'),
      "buffer": require.resolve('buffer/'),
      "zlib": require.resolve("browserify-zlib"),
      "querystring": require.resolve("querystring-es3"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "http": require.resolve("stream-http"),
      "fs": false, 
    "net": false,
    "https": require.resolve("stream-http"),   
  },
  },
};
