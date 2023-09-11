import createExpoWebpackConfigAsync from '@expo/webpack-config/webpack';
import { Arguments, Environment } from '@expo/webpack-config/webpack/types';
import path from "path"

module.exports = async function (env: Environment, argv: Arguments) {
    const config = await createExpoWebpackConfigAsync(env, argv);
    // Customize the config before returning it.
    config.resolve!.alias = {
        "@shared": path.resolve(__dirname, "../shared"),
    }
    config.module!.rules!.push({
        test: /\.ts$/,
        use: "ts-loader",
        exclude: "/node_modules/",
    })
    return config;
};
