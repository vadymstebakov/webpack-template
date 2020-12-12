const { merge } = require('webpack-merge');
const webpackConfiguration = require('../webpack.config');
const environment = require('./environment');

module.exports = merge(webpackConfiguration, {
    mode: 'development',

    /* Manage source maps generation process */
    devtool: 'eval-source-map',

    /* Development Server Configuration */
    devServer: {
        contentBase: environment.paths.output,
        watchContentBase: true,
        publicPath: '/',
        open: true,
        historyApiFallback: true,
        compress: true,
        hot: false,
        clientLogLevel: 'warn' || 'error' || 'warning',
        overlay: {
            errors: true,
        },
        watchOptions: {
            poll: 300,
        },
        ...environment.server,
    },

    /* File watcher options */
    watchOptions: {
        aggregateTimeout: 300,
        poll: 300,
        ignored: /node_modules/,
    },

    /* Additional plugins configuration */
    plugins: [],
});
