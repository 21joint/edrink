const path = require('path');
const pkg = require('./package');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const glob = require('glob');
// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');
const project = {
  BASE_URL: 'https://eatdrinkslc.com/',
  title: pkg.description.split('|')[0],
  description: pkg.description,
  nodePath: 'node_modules',
  src: path.join(__dirname, 'src'),
  assets: path.join(__dirname, 'src/assets'),
  fonts: path.join(__dirname, 'src/assets/fonts'),
  images: path.join(__dirname, 'src/assets/images'),
  icons: path.join(__dirname, 'src/assets/icomoon/fonts'),
  port: process.env.PORT || 2121,
  publicPath: '/'
};

const generateHTMLPlugins = () =>
  glob.sync('./src/**/*.html')
    .map(function (dir) {
      return new HtmlWebpackPlugin({
        filename: path.basename(dir), // Output
        template: dir, // Input,
        title: pkg.description
      });
    });

/**
 * Webpack Configuration
 */

module.exports = {
  entry: {
    vendor: './src/vendor.js',
    common: './src/common.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    modules: [
      'node_modules',
      project.src
    ],
    alias: {
      '~': project.nodePath
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      // SCSS
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: !IS_DEV,
                sourceMap: IS_DEV
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: IS_DEV,
                plugins: [
                  require('autoprefixer')({
                    browsers: ['last 3 versions']
                  })
                ]
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: IS_DEV
              }
            }
          ]
        })
      },

      // FONTS
      {
        test: /\.(woff|woff2|ttf|eot|svg|gif|png|jpe?g)$/,
        use: [
          'url-loader?limit=50000&name=/[folder]/[name].[ext]&fallback=file-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname + '/src'
      }
    }),
    new webpack.DefinePlugin({
      IS_DEV: IS_DEV
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    // new CopyWebpackPlugin([
    //   {
    //     from: 'src/assets/**/*',
    //     to: '[folder]/[name].[ext]',
    //     test: /\.(woff|woff2|ttf|eot|svg|gif|png|jpe?g)$/
    //   }]),
    ...generateHTMLPlugins(),
    new ExtractTextPlugin({
      filename: 'styles/[name].css'
    }),
    new ExtractTextPlugin({
      filename: '[name].html'
    })
  ],
  stats: {
    colors: true
  },
  devtool: 'eval'
};
