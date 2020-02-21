const path = require('path');
const glob = require('glob');
const ip = require('ip');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHTMLPlugin = require('script-ext-html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const autoprefixer = require('autoprefixer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const SshWebpackPlugin = require('ssh-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const isDeploy = process.env.DEPLOY === 'deployment';
const regexImages = /\.(png|jpe?g|svg|gif)$/i;

// Optimization
const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all',
		},
	};

	if (isProd) {
		config.minimizer = [
			new OptimizeCssAssetWebpackPlugin(),
			new TerserWebpackPlugin(),
		];
	}

	return config;
};

// Deploy
const deploy = () => {
	return new SshWebpackPlugin({
		host: 'host',
		port: 'port',
		username: 'username',
		password: 'password',
		cover: false,
		from: path.resolve(__dirname, 'dist'),
		to: 'to',
	});
};

// Pages
const multiplesHTMLPages = () => {
	const HTMLPages = [];
	const files = glob.sync(path.resolve(__dirname, 'src/*.html'), {});

	const sortFiles = files.filter(file => /[^index]\.html$/.test(file));

	const fileNames = sortFiles.map(sortFile => {
		const splitFile = sortFile.split('/');
		return splitFile[splitFile.length - 1].replace(/\.html/i, '');
	});

	HTMLPages.push(...fileNames);

	//NOTE: How many pages you will get
	console.log(`Pages: ${HTMLPages.join(', ')}`);

	return HTMLPages.map(
		HTMLPage =>
			new HTMLWebpackPlugin({
				filename: `${HTMLPage}.html`,
				template: `./${HTMLPage}.html`,
				inject: 'head',
				minify: {
					collapseWhitespace: isProd,
				},
			})
	);
};

// Style loaders
const styleLoaders = () => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll: true,
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
				plugins: [autoprefixer()],
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
const fileLoaders = (outputPath, publicPath) => {
	const loaders = [
		{
			loader: 'file-loader',
			options: {
				name: '[name].[ext]',
				outputPath,
				publicPath,
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

// Filename
const filename = ext => (isDev ? `[name].${ext}` : `[name].[hash].min.${ext}`);

// Plugins
const plugins = () => {
	const base = [
		new HTMLWebpackPlugin({
			template: './index.html',
			inject: 'head',
			minify: {
				collapseWhitespace: isProd,
			},
		}),
		...multiplesHTMLPages(),
		new ScriptExtHTMLPlugin({
			defer: ['main'],
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'src/images/**/**.*'),
				to: path.resolve(__dirname, 'dist'),
			},
		]),
		new MiniCssExtractPlugin({
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

	if (isProd) base.push(new BundleAnalyzerPlugin());
	if (isDeploy) base.push(deploy());

	return base;
};

// Webpack's module
module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './js/index.js'],
	},
	output: {
		filename: `js/${filename('js')}`,
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: optimization(),
	devServer: {
		host: ip.address(),
		port: 4200,
		// contentBase: path.join(__dirname, 'dist'),
		hot: isDev,
		// watchContentBase: isDev,
		overlay: {
			errors: true,
		},
	},
	devtool: isDev ? 'source-map' : '',
	plugins: plugins(),
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: /js/,
				use: jsLoaders(),
			},
			{
				test: /\.scss$/i,
				use: styleLoaders(),
			},
			{
				test: regexImages,
				include: /images/,
				use: fileLoaders(
					(file, resourcePath, context) => {
						const relativePath = path.relative(context, resourcePath);

						if (/svg/i.test(relativePath)) {
							return `images/svg/${file}`;
						}

						return `images/${file}`;
					},
					(file, resourcePath, context) => {
						const relativePath = path.relative(context, resourcePath);

						if (/svg/i.test(relativePath)) {
							return `../images/svg/${file}`;
						}

						return `../images/${file}`;
					}
				),
			},
			{
				test: /\.(ttf|eot|woff2|woff|svg)$/i,
				include: /fonts/,
				use: fileLoaders(
					(file, resourcePath, context) => {
						const relativePath = path.relative(context, resourcePath);

						if (/Roboto/i.test(relativePath)) {
							return `fonts/Roboto/${file}`;
						}

						if (/Arial/i.test(relativePath)) {
							return `fonts/Arial/${file}`;
						}

						return `fonts/${file}`;
					},
					(file, resourcePath, context) => {
						const relativePath = path.relative(context, resourcePath);

						if (/Roboto/i.test(relativePath)) {
							return `../fonts/Roboto/${file}`;
						}

						if (/Arial/i.test(relativePath)) {
							return `fonts/Arial/${file}`;
						}

						return `../fonts/${file}`;
					}
				),
			},
		],
	},
};
