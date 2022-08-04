const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.tsx',
    //target: 'electron-renderer',
    //devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                options: { presets: ["@babel/env"] }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /.(png|svg|jpe?g|gif|woff2?|ttf|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.ts$/,
                include: /src/,
                use: [{ loader: 'ts-loader' }]
            }
        ]
    },
    resolve: { extensions: ['*', '.js', '.jsx', '.ts', '.tsx'] },
    output: {
        filename: 'bundle.js',
        publicPath: '',
    },
    devServer: {
        port: 3000,
        hot: true
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
};