require("@babel/register");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const fs = require("fs");
const path = require("path");

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
  watch: true,
  entry: findEntryPoints(),
  resolve: {
    alias: {
      cpzDefaults: path.resolve(__dirname, "../cpz-shared/config/defaults"),
      cpzEventTypes: path.resolve(__dirname, "../cpz-shared/config/eventTypes"),
      cpzServices: path.resolve(__dirname, "../cpz-shared/config/services"),
      cpzState: path.resolve(__dirname, "../cpz-shared/config/state"),
      cpzStorageTables: path.resolve(
        __dirname,
        "../cpz-shared/config/storageTables"
      ),
      cpzUtils: path.resolve(__dirname, "../cpz-shared/utils")
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
