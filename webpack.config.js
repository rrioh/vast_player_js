const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/main.ts",
    output: {
        filename: "vast_player.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/"
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    devServer: {
        static: {
            directory: __dirname
        },
        client: {
            overlay: {
                errors: true,
                warnings: false
            }
        },
        allowedHosts: "all"
    }
}