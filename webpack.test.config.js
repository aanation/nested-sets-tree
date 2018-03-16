const webpack = require('webpack');
const path = require('path');

module.exports = {
    output: {
        path: path.resolve('./build'),
        publicPath: '/',
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/[id].[hash].js'	
    },	
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|dist)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: [
                          [
                            "es2015",
                            {
                              modules: false
                            }
                          ]
                        ]
                    }
                }
            },
            {
                test: /\.js/,
                exclude: /(test|node_modules)/,
                loader: 'istanbul-instrumenter-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"testing"' 
            }
        }),
    ]
};