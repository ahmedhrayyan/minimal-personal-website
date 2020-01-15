const path = require("path");

// plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, options) => {
  const devMode = options.mode === "development";
  return {
    entry: { main: "./src/index.js" },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: devMode ? "[name].js" : "[name].[contenthash].js",
    },
    devServer: {
      host: "0.0.0.0",
      port: "8080",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_module/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.s?css$/,
          use: [
            devMode ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: {
            loader: "file-loader",
            options: {
              name: devMode ? "[path][name].[ext]" : "[hash].[ext]",
              outputPath: "images",
            },
          },
        },
        {
          test: /\.pug$/,
          use: {
            loader: "pug-loader",
          },
        },
      ],
    },
    optimization: {
      minimizer: devMode
        ? []
        : [
            new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: true,
            }),
            new OptimizeCssAssetsPlugin({}),
          ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: devMode ? "[name].css" : "[name].[contenthash].css",
        chunkFilename: devMode ? "[id].css" : "[id].[contenthash].css",
      }),
      new HtmlWebpackPlugin({
        hash: true,
        template: "./src/index.pug",
        filename: "index.html",
      }),
      new HtmlWebpackPlugin({
        hash: true,
        template: "./src/ar/index.pug",
        filename: "ar/index.html",
      }),
    ],
  };
};
