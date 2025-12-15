const webpack = require("webpack");

// 从环境变量读取 basePath，如果没有设置则使用空字符串（根路径）
// 如果部署在子目录，设置环境变量：NEXT_PUBLIC_BASE_PATH=/temp/download/transform/out
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const config = {
  // Next.js 10.2.3 使用 next export 命令进行静态导出
  // output: 'export' 在 Next.js 11+ 才支持
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true
  },
  webpack(config, options) {
    config.node = {
      fs: "empty",
      module: "empty",
      net: "mock",
      tls: "mock",
      perf_hooks: "empty"
    };

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.DEV": JSON.stringify(options.dev),
        IN_BROWSER: !options.isServer,
        IS_DEV: options.dev
      })
    );

    config.module.rules.unshift({
      test: /\.worker\.ts/,
      use: {
        loader: "worker-loader",
        options: {
          name: "static/[hash].worker.js",
          publicPath: `${basePath}/_next/`
        }
      }
    });

    config.output.globalObject = 'typeof self !== "object" ? self : this';

    // Temporary fix for https://github.com/zeit/next.js/issues/8071
    config.plugins.forEach(plugin => {
      if (plugin.definitions && plugin.definitions["typeof window"]) {
        delete plugin.definitions["typeof window"];
      }
    });

    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";

    return config;
  }
};

module.exports = config;
