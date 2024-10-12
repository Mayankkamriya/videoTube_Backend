// const path = require('path');
// module.exports = {
//   // Your existing config
//   resolve: {
//     fallback: {
//       "zlib": false,
//       "querystring": false,
//       "path": false,
//       "crypto": false,
//       "stream": false,
//     },
//   },
// };




import path from 'path';
// const path = require('path');

module.exports = {
  // Your existing configuration...
  
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
      "fs": false,  // Use false if you don't need 'fs' in the browser
    "net": false,
    "https": require.resolve("stream-http"),   
  },
  },
};
