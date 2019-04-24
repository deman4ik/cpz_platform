const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

const config = {
  mode: "production",
  watch: false,
  entry: { index: path.resolve(__dirname, "src/index.js") },
  resolve: {
    alias: {
      cpz: path.resolve(__dirname, "../cpz-shared")
    }
  },
  output: {
    filename: "[name].js",
    path: `${__dirname}`,
    libraryTarget: "commonjs2"
  },
  devtool: "inline-source-map",
  target: "node",
  externals: [nodeExternals()],
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true
    })
  ]
};

module.exports = config;
