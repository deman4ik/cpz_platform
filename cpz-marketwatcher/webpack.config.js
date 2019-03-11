require("@babel/register");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

const pathsToClean = [path.resolve(__dirname, "dist")];

const config = {
  mode: process.env.NODE_ENV || "production",
  watch: false,
  entry: {
    server: path.resolve(__dirname, `src/server.js`),
    cryptocompare: path.resolve(__dirname, "src/providers/cryptocompare.js")
  },
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
      cpzEvents: path.resolve(__dirname, "../cpz-shared/eventgrid"),
      cpzUtils: path.resolve(__dirname, "../cpz-shared/utils"),
      cpzDayjs: path.resolve(__dirname, "../cpz-shared/utils/lib/dayjs"),
      cpzDB: path.resolve(__dirname, "../cpz-shared/db"),
      cpzConnector: path.resolve(__dirname, "../cpz-shared/connector"),
      cpzLog: path.resolve(__dirname, "../cpz-shared/log")
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
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true
    })
  ]
};

module.exports = config;
