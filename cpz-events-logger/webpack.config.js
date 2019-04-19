const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

const config = {
  stats: {
    moduleTrace: true,
    performance: true,
    warnings: true
  },
  mode: process.env.NODE_ENV || "development",
  watch: false,
  entry: path.resolve(__dirname, "src/index"),
  resolve: {
    alias: {
      cpz: path.resolve(__dirname, "../cpz-shared")
    }
  },
  output: {
    filename: "service.js",
    path: `${__dirname}/dist`,
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  devtool: "inline-source-map",
  target: "node",
  externals: [nodeExternals()],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true
    })
  ]
};

module.exports = config;
