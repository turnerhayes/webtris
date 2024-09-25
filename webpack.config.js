const {resolve} = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    output: {
        filename: "bundle.js",
        path: resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: "/node_modules/",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webtris",
            template: "./src/index.html",
        }),
    ],
    resolve: {
        extensions: [
            ".ts",
            ".js",
        ]
    },
    devtool: "inline-source-map",
};
