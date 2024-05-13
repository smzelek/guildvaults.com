const path = require('path');
const { DefinePlugin } = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

process.env.COMMIT_HASH = commitHash;

module.exports = {
    entry: {
        app: './src/frontend/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, '../www'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
            frontend: path.resolve(__dirname, '../src/frontend'),
            backend: path.resolve(__dirname, '../src/backend'),
        },
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: ['babel-loader'], exclude: /node_modules/ },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
        ],
    },
    plugins: [
        new DefinePlugin({
            'process.env.COMMIT_HASH': JSON.stringify(commitHash),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/frontend/index.html'),
            filename: 'index.html',
            inject: 'body',
            chunks: ['app'],
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../src/frontend/assets'), to: 'assets' },
            ],
        })
    ]
};
