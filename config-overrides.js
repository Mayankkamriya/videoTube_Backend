import webpack from 'webpack';

// const webpack = require('webpack');



module.exports = {
    webpack: function(config, env) {
        config.resolve.fallback = {
            "zlib": require.resolve("browserify-zlib"),
            "querystring": require.resolve("querystring-es3"),
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "http": require.resolve("stream-http"),
            "fs": false,
            "net": false,
        };
        config.plugins.push(
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        );
        return config;
    },
};
