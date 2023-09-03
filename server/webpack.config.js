const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: "/node_modules/",
      },
    ],
  },
  devtool: "inline-source-map",
  target: "node", // without this, webpack will compile for browser, through which an error "WebSocketServer is not a constructor" will be thrown.
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  }, // https://github.com/websockets/ws/issues/1126
};
