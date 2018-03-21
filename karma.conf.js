const webpackConfig = require('./webpack.test.config');
const webpack = require("webpack");

module.exports = function (config) {
	config.set({
		files: [
			'test/test.js'
		], 
		frameworks: ['mocha', 'chai'],
		preprocessors: {
			'test/test.js': ['webpack']
		},
		webpack: webpackConfig,
		webpackMiddleware: {
			noInfo: true
		},
		reporters: ['mocha', 'spec', 'coverage'],
		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type: 'html' },
				{ type: 'text' },
				{ type: 'text-summary' }
			]
		},
		browsers: ['Chrome', 'Firefox'], 
		plugins: [
			require("karma-firefox-launcher"),
			require("karma-chrome-launcher"),
			require("karma-webpack"),
			require("karma-mocha"),
			require("karma-chai"),
			require("karma-coverage"),
			require("istanbul-instrumenter-loader"),
			require("karma-mocha-reporter"),
			require("karma-spec-reporter")
		]
	})
}