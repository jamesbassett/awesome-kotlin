const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// What's New in Webpack 2
// https://gist.github.com/sokra/27b24881210b56bbaff7

// Webpack 2 Documentation
// https://webpack.js.org/

module.exports = function (options = {}) {
  // Settings
  // --env.GAPI_KEY key --env.SOURCE_MAP source-map ...
  const NODE_ENV = options.NODE_ENV || 'development'; // 'production'
  const SOURCE_MAP = options.SOURCE_MAP || 'eval-source-map'; // 'source-map'

  console.log(`
Build started with following configuration:
===========================================
→ NODE_ENV: ${NODE_ENV}
→ SOURCE_MAP: ${SOURCE_MAP}
`);

  const postcssOptions = {
    plugins: () => ([
      autoprefixer({
        browsers: ['last 2 versions']
      })
    ])
  };

  const config = {
    entry: {
      vendor: [
        'babel-polyfill',
        'react-router',
        'react'
      ],
      app: [
        path.resolve(__dirname, 'app', 'src', 'main.tsx')
      ]
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js?[hash]',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.tsx', '.js']
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        loader: 'ts',
        include: path.resolve(__dirname, 'app', 'src')
      }, {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.less$/,
        use: [{
          loader: 'style'
        }, {
          loader: 'css',
          options: {
            modules: true,
            localIdentName: '[name]_[local]',
            minimize: true
          }
        }, {
          loader: 'postcss',
          options: postcssOptions
        }, {
          loader: 'less'
        }]
      }, {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "url?limit=32768"
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'app', 'index.html'),
        favicon: path.resolve(__dirname, 'app', 'favicon.ico'),
        hash: true
      })
    ],
    devtool: SOURCE_MAP,
    devServer: {
      colors: true,
      inline: false,
      port: 8080,
      stats: {
        chunkModules: false,
        colors: true
      },
      historyApiFallback: true
    }
  };

  if (NODE_ENV === 'production') {
    config.plugins = [
      ...config.plugins,
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: 2
      })
    ];
  }

  return config;
};
