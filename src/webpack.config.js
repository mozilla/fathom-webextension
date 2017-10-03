var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var APP_DIR = path.resolve(__dirname);
var WISHLIST_APP_DIR = APP_DIR + "/wishlist_sidebar";

var BUILD_DIR = path.resolve(__dirname, 'build');
var WISHLIST_BUILD_DIR = BUILD_DIR + '/wishlist_sidebar';

var sidebar_config = {
    entry: WISHLIST_APP_DIR + '/index.jsx',
    devtool: 'eval-source-map',
    output: {
        path: WISHLIST_BUILD_DIR,
        filename: './bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: { presets: ['env', 'react']}
            },
        ]
    },
    resolve: {
        "alias": {
            "react": "preact-compat",
            "react-dom": "preact-compat",
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: WISHLIST_APP_DIR + '/index.template.ejs',
            root: 'app', // TODO: this reference to 'app' is duplicated in index.jsx - need to refactor and consolidate this
            title: 'Wishlist',
        }),
        new CopyWebpackPlugin([
            { from: 'icons', to: BUILD_DIR+'/icons' },
            { from: 'popup', to: BUILD_DIR+'/popup' },
            { from: 'background.js', to: BUILD_DIR },
            { from: 'manifest.json', to: BUILD_DIR },
        ]),
    ]
};

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

module.exports = [product_config, sidebar_config];
