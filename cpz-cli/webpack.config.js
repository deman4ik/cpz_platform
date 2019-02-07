require("@babel/register");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

// the path(s) that should be cleaned
// const pathsToClean = [path.resolve(__dirname, "dist")];

const config = {
  mode: "production",
  watch: false,
  entry: { index: path.resolve(__dirname, "src/index.js") },
  resolve: {
    alias: {
      cpzEnv: path.resolve(__dirname, "../cpz-shared/config/environment"),
      cpzDefaults: path.resolve(__dirname, "../cpz-shared/config/defaults"),
      cpzEventTypes: path.resolve(__dirname, "../cpz-shared/config/eventTypes"),
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
      cpzDB: path.resolve(__dirname, "../cpz-shared/db"),
      cpzKeyVault: path.resolve(__dirname, "../cpz-shared/keyVault")
    }
  },
  output: {
    filename: "[name].js",
    path: `${__dirname}`,
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
    // new CleanWebpackPlugin(pathsToClean),
    new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true
    })
  ]
};

module.exports = config;
