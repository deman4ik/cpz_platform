const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

const config = {
  mode: "production",
  watch: false,
  entry: { index: path.resolve(__dirname, "src/index.js") },
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
      cpzDB: path.resolve(__dirname, "../cpz-shared/db"),
      cpzKeyVault: path.resolve(__dirname, "../cpz-shared/keyVault"),
      cpzLog: path.resolve(__dirname, "../cpz-shared/log")
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
