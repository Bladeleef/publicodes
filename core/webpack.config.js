/* eslint-env node */
const path = require('path')

const babelLoader = {
	loader: 'babel-loader',
	options: {
		cacheDirectory: true,
		rootMode: 'upward',
		presets: [
			[
				'@babel/preset-env',
				{
					targets: {
						esmodules: true,
					},
					useBuiltIns: 'entry',
					corejs: '3',
				},
			],
		],
	},
}
const common = {
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	entry: path.resolve(__dirname, 'source', 'index.ts'),
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				use: babelLoader,
				exclude: /node_modules|dist/,
			},
			{
				test: /\.ne$/,
				use: [babelLoader, 'nearley-loader'],
			},
			{
				test: /\.yaml$/,
				use: ['json-loader', 'yaml-loader'],
			},
			// Fixes fsevents bug import bug, see https://stackoverflow.com/questions/64103792/fsevents-causes-module-parse-failed-unexpected-character
			{
				test: /.node$/,
				loader: 'node-loader',
			},
		],
	},
}

module.exports = [
	{
		...common,
		output: {
			filename: 'index.js',
			path: path.join(__dirname, 'dist', 'esm'),
			libraryTarget: 'module',
		},
		experiments: {
			outputModule: true,
		},
	},
	{
		...common,
		output: {
			filename: 'index.js',
			path: path.join(__dirname, 'dist', 'umd'),
			library: 'publicodes',
			libraryTarget: 'umd',
			globalObject: 'this',
		},
		externals:
			// Every non-relative module is external
			/^[a-z\-0-9]+$/,
	},
	// Add a .min.js version for browser in production mode
	process.env.NODE_ENV === 'production' && {
		...common,
		output: {
			filename: 'index.min.js',
			library: 'publicodes',
			libraryTarget: 'global',
		},
	},
].filter(Boolean)
