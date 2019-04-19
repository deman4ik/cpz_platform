const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

const config = {
  mode: process.env.NODE_ENV || "production",
  watch: false,
  entry: {
    service: path.resolve(__dirname, `src/index`)
  },
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
      },
      {
        exclude: /node_modules/,
        test: /\.graphql$/,
        use: [{ loader: "graphql-import-loader" }]
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
