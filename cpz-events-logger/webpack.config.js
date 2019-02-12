require("@babel/register");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const fs = require("fs");
const path = require("path");

// the path(s) that should be cleaned
const pathsToClean = [path.resolve(__dirname, "dist")];

/**
 * Finds all functions entry points from /src/funcs
 *
 * @returns {object} entry
 */
function findEntryPoints() {
  const entry = {};
  fs.readdirSync(path.resolve(__dirname, "src/funcs")).forEach(file => {
    const key = file.replace(".js", "");
    entry[key] = path.resolve(__dirname, `src/funcs/${file}`);
  });
  return entry;
}

const config = {
  mode: process.env.NODE_ENV || "development",
  watch: false,
  entry: findEntryPoints(),
  resolve: {
    alias: {
      cpzConfig: path.resolve(__dirname, "../cpz-shared/config"),
      cpzEnv: path.resolve(__dirname, "../cpz-shared/config/environment"),
      cpzDefaults: path.resolve(__dirname, "../cpz-shared/config/defaults"),
      cpzEventTypes: path.resolve(
        __dirname,
        "../cpz-shared/config/events/types"
      ),
      cpzServices: path.resolve(__dirname, "../cpz-shared/config/services"),
      cpzState: path.resolve(__dirname, "../cpz-shared/config/state"),
      cpzStorageTables: path.resolve(
        __dirname,
        "../cpz-shared/config/storageTables"
      ),
      cpzStorage: path.resolve(__dirname, "../cpz-shared/tableStorage"),
      cpzQueuesList: path.resolve(__dirname, "../cpz-shared/config/queues"),
      cpzQueue: path.resolve(__dirname, "../cpz-shared/queueStorage"),
      cpzEvents: path.resolve(__dirname, "../cpz-shared/eventgrid"),
      cpzUtils: path.resolve(__dirname, "../cpz-shared/utils"),
      cpzDayjs: path.resolve(__dirname, "../cpz-shared/utils/lib/dayjs"),
      cpzDB: path.resolve(__dirname, "../cpz-shared/db")
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
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        },
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  devtool: "inline-source-map",
  target: "node",
  externals: [nodeExternals()],
  plugins: [
    new CleanWebpackPlugin(pathsToClean),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true
    })
  ]
};

module.exports = config;
