const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

const config = {
  mode: process.env.NODE_ENV || "production",
  watch: false,
  entry: {
    server: path.resolve(__dirname, `src/server.js`),
    importerProcess: path.resolve(__dirname, "src/importer/process.js")
  },
  resolve: {
    alias: {
      cpz: path.resolve(__dirname, "../cpz-shared")
    }
  },
  output: {
    filename: "[name].js",
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
