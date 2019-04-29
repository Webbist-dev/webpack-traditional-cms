const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlPluginRemove = require('html-webpack-plugin-remove');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const chokidar = require('chokidar');

module.exports = (env, argv) => {

  env = env || {};
  const isProd = env.isProd;
  const isDev = !isProd;

  const styleHandling = isProd 
    ? MiniCssExtractPlugin.loader
    : { loader: 'style-loader', options: { sourceMap: true } };

  return {
    mode: isDev ? 'development' : 'production',
    entry: {
      'main': './src/index.js'
    },
    output: {
      filename: isDev ? '[name].js' : '[name].[hash].js',
      chunkFilename: isDev ? '[id].js' : '[id].[hash].js',
      // TODO: #3
      publicPath: '/assets/'
    },
    devtool: isDev ? 'inline-source-map' : 'source-map',
    devServer: {
      before(app, server) {
        // TODO: 4
        chokidar.watch([
          './mock-cms/views/**/*.handlebars'
        ]).on('all', function() {
          server.sockWrite(server.sockets, 'content-changed');
        })
      },
      index: '',
      hot: true,
      // TODO: #3
      publicPath: '/assets/',
      compress: true,
      port: 8080,
      // TODO: #1
      proxy: {
        '/': 'http://localhost:5000'
      }
    },
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          styleHandling,
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ]
      }]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isDev ? '[name].css' : '[name].[hash].css',
        chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
      }),
      new HtmlWebpackPlugin({
        filename: 'main.handlebars',
        // TODO: 2
        template: './mock-cms/views/layouts/main.handlebars'
      }),
      new HtmlPluginRemove(/<script data\-html\-webpack\-remove.*<\/script>/)
    ]
  };
}
