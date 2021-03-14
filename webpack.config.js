const path = require('path');
const environment = require('./configuration/environment');
const fs = require('fs');
const chalk = require('chalk');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

// eslint-disable-next-line no-console
const log = console.log;
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const isStats = process.env.NODE_ENV === 'stats';
const regexImages = /\.(png|jpe?g|svg|gif)$/i;

// Filename
const filename = (ext, name = '[name]') => (isDev ? `${name}.${ext}` : `${name}.[contenthash:10].min.${ext}`);

// Optimization
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendors',
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    };

    if (isProd || isStats) {
        config.minimize = true;
        config.minimizer = [
            new TerserWebpackPlugin({
                parallel: true,
            }),
            new CssMinimizerPlugin({
                parallel: true,
                minimizerOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
        ];
    }

    return config;
};

// Templates
const templatesHTML = () => {
    const pages = [];
    const templates = fs
        .readdirSync(path.resolve(__dirname, environment.paths.source, 'templates'))
        .filter(file => /\.html$/.test(file));

    pages.push(...templates);

    /*
        NOTE: How many pages you will get
    */
    log(chalk.black.bgWhite.bold(`### Get pages: ${chalk.red.bgWhite.bold(pages.join(', '))}`));

    return pages.map(
        page =>
            new HTMLWebpackPlugin({
                filename: page,
                template: path.resolve(environment.paths.source, 'templates', page),
                minify: isProd || isStats,
            })
    );
};

// SVG Sprite
const putSVGSprite = () => {
    return new HTMLWebpackPlugin({
        filename: 'images/symbol-sprite/symbol-sprite.html',
        template: path.resolve(environment.paths.images, 'symbol-sprite', 'symbol-sprite.html'),
        inject: false,
        minify: isProd || isStats,
    });
};

// Style loaders
const styleLoaders = () => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: '../',
            },
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: isDev,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ['autoprefixer'],
                },
                sourceMap: isDev,
            },
        },
        {
            loader: 'sass-loader',
            options: {
                sourceMap: isDev,
            },
        },
    ];

    return loaders;
};

// File loaders
const fileLoaders = () => {
    const loaders = [
        {
            loader: 'file-loader',
            options: {
                esModule: false,
                name: '[path][name].[ext]',
            },
        },
    ];

    return loaders;
};

// Js loaders
const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                babelrc: false,
                configFile: path.resolve(__dirname, 'babel.config.json'),
            },
        },
    ];

    if (isDev) {
        loaders.push('eslint-loader');
    }

    return loaders;
};

// Plugins
const plugins = () => {
    const base = [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `styles/${filename('css')}`,
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: environment.paths.images,
                    to: 'images/',
                    force: true,
                    toType: 'dir',
                    globOptions: {
                        ignore: ['**/*.DS_Store', '**/Thumbs.db', '**/symbol-sprite/**'],
                    },
                },
                {
                    from: environment.paths.fonts,
                    to: 'fonts/',
                    force: true,
                    toType: 'dir',
                    globOptions: {
                        ignore: ['**/*.DS_Store', '**/Thumbs.db'],
                    },
                },
            ],
        }),
        new ImageminPlugin({
            disable: isDev,
            test: regexImages,
            pngquant: {
                quality: '60-100',
            },
        }),
        putSVGSprite(),
        ...templatesHTML(),
    ];

    if (isStats) base.push(new BundleAnalyzerPlugin());

    return base;
};

// Modules of webpack
module.exports = {
    context: environment.paths.source,
    entry: {
        app: [
            '@babel/polyfill',
            'element-closest-polyfill',
            path.resolve(environment.paths.source, 'scripts', 'index.js'),
        ],
    },
    output: {
        filename: `scripts/${filename('js')}`,
        path: environment.paths.output,
        publicPath: '',
    },
    optimization: optimization(),
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /scripts/,
                use: jsLoaders(),
            },
            {
                test: /\.scss$/i,
                include: /styles/,
                use: styleLoaders(),
            },
            {
                test: regexImages,
                include: /images/,
                use: fileLoaders(),
            },
            {
                test: /\.(ttf|eot|woff2|woff|svg)$/i,
                include: /fonts/,
                use: fileLoaders(),
            },
        ],
    },
    plugins: plugins(),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@helpers': path.resolve(__dirname, 'src/scripts/helpers'),
            '@components': path.resolve(__dirname, 'src/scripts/components'),
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
    target: 'web',
};
