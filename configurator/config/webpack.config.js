const { resolve } = require('./utils');
const { PATH_CONFIG } = require('./config');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('development')
  }
});

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    src: resolve(PATH_CONFIG.MAIN)
  },
  output: {
    path: resolve(PATH_CONFIG.OUTPUT),
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false
            }
          }
        ]
      },
      {
        test: /\.svg/,
        use: {
          loader: 'svg-url-loader',
          options: {}
        }
      },
      {
        test: /\.(png|jpg|gif|woff|eot|woff2|ttf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash].[ext]',
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    definePlugin,
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      publicPath: '../'
    })
  ]
};
