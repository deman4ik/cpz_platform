require("@babel/register");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const fs = require("fs");
const path = require("path");

function findEntryPoints() {
  const entry = {};
  fs.readdirSync(path.resolve(__dirname, "src/funcs")).forEach(file => {
    const key = file.replace(".js", "");
    entry[key] = path.resolve(__dirname, `src/funcs/${file}`);
  });
  return entry;
}

/**
 * Finds all functions entry points from /src/funcs
 *
 * @returns {object} entry
 */
const config = {
  mode: process.env.NODE_ENV || "production",
  watch: false,
  entry: findEntryPoints(),
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
        /* use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }, */
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
