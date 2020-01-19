const path = require('path');
const ip = require('ip');
const HWP = require('html-webpack-plugin');
const ScriptExtHTMLPlugin = require('script-ext-html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CWP = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	};
  
	if (isProd) {
		config.minimizer = [
			new OptimizeCssAssetWebpackPlugin(),
			new TerserWebpackPlugin()
		]
	}
  
	return config;
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].min.${ext}`;

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: './js/script.js',
	},
	output: {
		filename: `js/${filename('js')}`,
   		path: path.resolve(__dirname, 'dist')
	},
	optimization: optimization(),
	devServer: {
		host: ip.address(),
		port: 4200,
		hot: isDev
	},
	plugins: [
		new HWP({
			template: './index.html',
			inject: 'head',
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new HWP({
			filename: 'list.html',
			template: './list.html',
			inject: 'head',
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new ScriptExtHTMLPlugin({
			defer: ['main']
		}),
		new CleanWebpackPlugin(),
		new CWP([
			{
				from: path.resolve(__dirname, 'src/images/favicon.ico'),
				to: path.resolve(__dirname, 'dist/images')
			}
		]),
		new MiniCssExtractPlugin({
			filename: `style/${filename('css')}`
		})
	],
	resolve: {
		// extensions: ['.js', '.json', '.png'],
		alias: {
			// '@models': path.resolve(__dirname, 'src/models'),
			'@': path.resolve(__dirname, 'src'),
		}
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							options: {
								
							},
							hrm: isDev,
							reloadAll: true
						},
					},
				  	'css-loader'
				]
			},
			{
				test: /\.(png|jpe?g|svg|gif)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'images',
						}
					}
				],
			},
			{
				test: /\.(ttf|eot|woff2|woff)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts',
						}
					}
				],
			}
		]
	}
}