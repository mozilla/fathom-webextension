var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');


var APP_DIR = path.resolve(__dirname);
var WISHLIST_APP_DIR = APP_DIR + "/wishlist_sidebar";

var BUILD_DIR = path.resolve(__dirname, 'build');
var WISHLIST_BUILD_DIR = BUILD_DIR + '/wishlist_sidebar';

var product_config = {
    entry: APP_DIR + '/preprocessed.js',
    output: {
        path: BUILD_DIR,
        filename: './product-extension.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
            }
        ],
    },
    plugins: [
        // We need to explicitly drop JSDOM stuff because
        // fathom-web incorrectly includes it in fathom-web/utils.js
        // but only uses jsdom for testcases.
        new webpack.IgnorePlugin(/jsdom.*/)
    ]
};

module.exports = product_config;
