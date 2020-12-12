const path = require('path');
const environment = require('./configuration/environment');
const glob = require('glob');
const chalk = require('chalk');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

// eslint-disable-next-line no-console
const log = console.log;
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const regexImages = /\.(png|jpe?g|svg|gif)$/i;

// Filename
const filename = (ext, name = '[name]') => (isDev ? `${name}.${ext}` : `${name}.[hash].min.${ext}`);

// Optimization
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                defaultVendors: {
                    filename: `scripts/${filename('js', 'vendors')}`,
                },
            },
        },
    };

    if (isProd) {
        config.minimize = true;
        config.minimizer = [
            new TerserWebpackPlugin({
                parallel: true,
            }),
            new CssMinimizerPlugin(),
        ];
    }

    return config;
};

// Pages
const multiplesHTMLPages = () => {
    const HTMLPages = [];
    const files = glob.sync(path.resolve(__dirname, 'src/*.html'), {});

    const sortFiles = files.filter(file => /^((?!index.html).)*$/.test(file));

    const fileNames = sortFiles.map(sortFile => {
        const splitFile = sortFile.split('/');
        return splitFile[splitFile.length - 1].replace(/\.html/i, '');
    });

    HTMLPages.push(...fileNames);

    //NOTE: How many pages you will get
    log(chalk.black.bgWhite.bold(`### Get pages: ${chalk.red.bgWhite.bold(HTMLPages.join(', '))}`));

    return HTMLPages.map(
        HTMLPage =>
            new HTMLWebpackPlugin({
                filename: `${HTMLPage}.html`,
                template: `./${HTMLPage}.html`,
                minify: {
                    collapseWhitespace: isProd,
                },
            })
    );
};

// SVG Sprite
const putSVGSprite = () => {
    return new HTMLWebpackPlugin({
        filename: 'images/symbol-sprite/symbol-sprite.html',
        template: './images/symbol-sprite/symbol-sprite.html',
        inject: false,
        minify: {
            collapseWhitespace: isProd,
        },
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

// Babel options
const babelOptions = preset => {
    const opts = {
        presets: ['@babel/preset-env'],
    };

    if (preset) opts.presets.push(preset);

    return opts;
};

// Js loaders
const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: babelOptions(),
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
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd,
            },
        }),
        ...multiplesHTMLPages(),
        new CleanWebpackPlugin({
            verbose: true,
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/images/'),
                    to: 'images/',
                    force: true,
                },
                {
                    from: path.resolve(__dirname, 'src/fonts/'),
                    to: 'fonts/',
                    force: true,
                },
            ],
        }),
        putSVGSprite(),
        // new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            // filename: isDev ? 'styles/style.css' : 'styles/style.[hash].min.css',
            filename: `styles/${filename('css')}`,
        }),
        new ImageminPlugin({
            disable: isDev,
            test: regexImages,
            pngquant: {
                quality: '95-100',
            },
        }),
    ];

    // if (isProd) base.push(new BundleAnalyzerPlugin());

    return base;
};

// Webpack's module
module.exports = {
    context: environment.source,
    entry: {
        // app: path.resolve('./src', 'scripts', 'index.js'),
        app: ['@babel/polyfill', 'element-closest-polyfill', path.resolve('./src', 'scripts', 'index.js')],
    },
    output: {
        filename: `scripts/${filename('js')}`,
        path: environment.output,
        publicPath: '/',
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
            '@scripts': path.resolve(__dirname, 'src/scripts'),
            '@helpers': path.resolve(__dirname, 'src/scripts/helpers'),
            '@components': path.resolve(__dirname, 'src/scripts/components'),
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
    target: isDev ? 'web' : 'browserslist',
};
